#!/usr/bin/env python3
"""Repository-only recovery renderer. Run in the owner's networkless namespace."""

import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import sys
import sysconfig

import pypdfium2 as pdfium


PINS = {"pypdfium2": "5.14.0", "Pillow": "12.1.1"}
MAX_PAGES = 100
MAX_PDF_BYTES = 64 * 1024 * 1024
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_PAGE_PIXELS = 24_000_000
SCALE = 4 / 3  # 96 dpi; complete page, no crop or selected page range.


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with path.open("x", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2)
        handle.write("\n")
    path.chmod(0o600)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--public-out", type=Path, required=True)
    parser.add_argument("--public-runtime", type=Path, required=True)
    parser.add_argument("--input-root", type=Path)
    options = parser.parse_args()
    for name, version in PINS.items():
        if importlib.metadata.version(name) != version:
            raise RuntimeError(f"Unexpected renderer dependency: {name}")
    receipt_bytes = options.receipt.read_bytes()
    receipt = json.loads(receipt_bytes)
    if receipt.get("schema_version") != "peccable-v3-recovery-evidence-v1":
        raise ValueError("Unexpected collector receipt")
    source_root = Path(receipt["out"])
    options.out.mkdir(mode=0o700, exist_ok=True)
    if any(options.out.iterdir()):
        raise ValueError("Renderer output must be empty")
    package_root = Path(sysconfig.get_paths()["purelib"])
    runtime_files = []
    for filename in sorted(package_root.rglob("*")):
        if filename.is_file() and "__pycache__" not in filename.parts:
            data = filename.read_bytes()
            runtime_files.append({"path": str(filename.relative_to(package_root)), "bytes": len(data), "sha256": sha(data)})
    python_binary = Path(sys._base_executable)
    python_bytes = python_binary.read_bytes()
    report = {
        "schema_version": "peccable-recovery-pdf-raster-v1",
        "input_receipt_sha256": sha(receipt_bytes),
        "dependencies": PINS,
        "renderer_source_sha256": sha(Path(__file__).read_bytes()),
        "runtime_inventory": {"path": str(options.public_runtime / package_root.relative_to(Path(sys.prefix))), "files": runtime_files},
        "python_binary": {"path": str(python_binary), "bytes": len(python_bytes), "sha256": sha(python_bytes)},
        "pdfium": str(pdfium.version.PDFIUM_INFO),
        "python": sys.version,
        "render_scale": SCALE,
        "scope": "Every native PDF page rendered without crop. Text extraction is not proof of visibility. Physical printer and OS dialog are unobserved.",
        "isolation": {
            "network_namespace": os.readlink("/proc/self/ns/net"),
            "mount_namespace": os.readlink("/proc/self/ns/mnt"),
            "real_user_config_visible": Path("/home/bbferko/.config").exists(),
            "inherited_provider_variables": [key for key in os.environ if re.search(r"OPENAI|API_KEY|TOKEN|CREDENTIAL", key)],
        },
        "artifacts": [],
        "failures": [],
    }
    for item in receipt["artifacts"]:
        if item.get("print") is None:
            continue
        artifact_id = item["artifactId"]
        if not re.fullmatch(r"[a-f0-9]{20}", artifact_id):
            raise ValueError("Unsafe artifact identity")
        result = {"artifactId": artifact_id, "resources": [], "pages": [], "failures": [], "complete": False}
        report["artifacts"].append(result)
        document = None
        try:
            if len(item["pdfPaths"]) != 1:
                raise ValueError("Exactly one complete native PDF is required")
            original = Path(item["pdfPaths"][0])
            relative = original.relative_to(source_root)
            if ".." in relative.parts:
                raise ValueError("Unsafe source PDF path")
            source = (options.input_root or options.receipt.parent) / relative
            if source.is_symlink() or not source.is_file():
                raise ValueError("PDF is not a regular collected file")
            descriptor = next(value for value in item["resources"] + item["retainedResources"] if value["path"] == str(original))
            if source.stat().st_size > MAX_PDF_BYTES:
                raise ValueError("Complete PDF exceeds the declared byte bound")
            data = source.read_bytes()
            if len(data) != descriptor["bytes"] or sha(data) != descriptor["sha256"] or len(data) > MAX_PDF_BYTES:
                raise ValueError("PDF identity or byte bound differs")
            document = pdfium.PdfDocument(data)
            count = len(document)
            if not 0 < count <= MAX_PAGES:
                raise ValueError("Complete page count exceeds the declared bound")
            result["pdf"] = {"sha256": sha(data), "bytes": len(data), "pages": count}
            for index in range(count):
                page = bitmap = image = textpage = None
                try:
                    page = document[index]
                    width, height = page.get_size()
                    if width <= 0 or height <= 0 or width * height * SCALE * SCALE > MAX_PAGE_PIXELS:
                        raise ValueError("Page dimensions exceed the complete-image bound")
                    bitmap = page.render(scale=SCALE)
                    image = bitmap.to_pil()
                    location = f"evidence/recovery-print-page-{index + 1}.png"
                    relative_output = Path("artifacts") / artifact_id / location
                    destination = options.out / relative_output
                    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
                    with destination.open("xb") as handle:
                        image.save(handle, format="PNG")
                    destination.chmod(0o600)
                    image_bytes = destination.read_bytes()
                    if len(image_bytes) > MAX_IMAGE_BYTES:
                        raise ValueError("Complete page retained but exceeds image release bound")
                    textpage = page.get_textpage()
                    result["pages"].append({"page": index + 1, "size_points": [width, height], "image_dimensions": list(image.size), "image_sha256": sha(image_bytes), "text": textpage.get_text_bounded(), "text_scope": "Extracted PDF text, not independent visibility evidence"})
                    result["resources"].append({"location": location, "path": str(options.public_out / relative_output), "kind": "rendered", "sha256": sha(image_bytes), "bytes": len(image_bytes), "scope": report["scope"]})
                finally:
                    for resource in (textpage, image, bitmap, page):
                        if resource is not None:
                            resource.close()
            result["complete"] = len(result["pages"]) == count
            location = "evidence/recovery-print-pages.json"
            relative_output = Path("artifacts") / artifact_id / location
            metadata = {"complete": result["complete"], "pdf": result["pdf"], "pages": result["pages"], "render_scale": SCALE, "scope": report["scope"]}
            destination = options.out / relative_output
            write_json(destination, metadata)
            metadata_bytes = destination.read_bytes()
            result["resources"].append({"location": location, "path": str(options.public_out / relative_output), "kind": "measured", "sha256": sha(metadata_bytes), "bytes": len(metadata_bytes), "scope": report["scope"]})
        except Exception as error:
            failure = {"artifactId": artifact_id, "error": f"{type(error).__name__}: {error}"}
            result["failures"].append(failure)
            report["failures"].append(failure)
            # A partial page set must never be presented as complete print evidence.
            result["resources"] = []
        finally:
            if document is not None:
                document.close()
    report["complete"] = len(report["artifacts"]) == 9 and all(item["complete"] and not item["failures"] for item in report["artifacts"])
    write_json(options.out / "receipt.json", report)
    print(json.dumps({"complete": report["complete"], "artifacts": len(report["artifacts"]), "pages": sum(len(item["pages"]) for item in report["artifacts"]), "failures": report["failures"]}))
    return 0 if report["complete"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
