/**
 * Repository-maintenance harness; never imported by the skill payload.
 * Owner use: await startBrowser({workspace, scratch, executablePath,
 *   bwrapPath: '/usr/bin/bwrap',
 *   codingAgentPackage: '/.../@oh-my-pi/pi-coding-agent/package.json'}).
 * executablePath wins over PECCABLE_BROWSER_EXECUTABLE, then
 * PUPPETEER_EXECUTABLE_PATH. There is deliberately NO binary search/download.
 * codingAgentPackage defaults to PECCABLE_CODING_AGENT_PACKAGE, a normally
 * resolvable installed package, or ~/.bun/install/global/node_modules's package.
 * Only the installed package's pinned puppeteer-core 25.3.0 is accepted.
 *
 * Give the author ONLY tools.actions/tools.invoke (bind with the owner's SDK).
 * Keep browser/page, scale/reset, evidence and close in the evaluator context.
 * Wide/narrow are CSS viewport sizes at deviceScaleFactor=1, mobile=false;
 * viewport resizing is NOT pinch zoom. CDP page scale is reset to 1. Actual
 * inner dimensions, visual viewport scale and DPR are returned, not assumed.
 * scaleText(page,2) is a controlled computed-font snapshot override, NOT browser
 * zoom: every element receives twice its OWN baseline font size in CSS px, so
 * nested inherited text does not compound to 4x. Numeric line heights double;
 * 'normal' remains normal. Layout is allowed to reflow without changing widths.
 * Pseudo-elements are snapshotted separately. Existing page styles are restored
 * by resetTextScale. Repeated scaleText calls restore the previous snapshot
 * before resnapshotting, so they remain 2x rather than compounding. In contrast,
 * ensureTextScale observationally reuses a verified snapshot without any writes.
 * It takes a fresh baseline after navigation, added/removed nodes, app font
 * writes, or changed applicable author font sources. It never repairs focus or
 * scroll. Inaccessible/unsupported font sources remain explicit uncertainty.
 * There is no automatic mutation styling; raw observations remain available.
 *
 * Chrome runs only inside a fail-closed bubblewrap filesystem/user/PID/IPC/UTS
 * namespace with no capabilities. Only system libraries/fonts, its read-only
 * binary directory, and this trial's writable profile/home/tmp are mounted.
 * The driver, static server and exact-origin HTTP proxy remain outside it.
 * Host networking is retained to reach that proxy: proxy/interception policy
 * is NOT an OS network ACL. Owner network supervision is still required for
 * hostile-code network containment. No host browser fallback is permitted.
 * SIGKILL or a machine crash cannot run JS cleanup; bubblewrap's parent-death
 * policy retires the browser namespace, with owner supervision still required.
 */
import {createServer, request as httpRequest} from 'node:http';
import {createReadStream, constants as fsConstants} from 'node:fs';
import {access, mkdir, mkdtemp, open, readFile, readdir, readlink, realpath, rm, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile, spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const VERSION = '25.3.0';
export const VIEWPORTS = Object.freeze({
  wide: Object.freeze({width: 1440, height: 1000, deviceScaleFactor: 1, isMobile: false, hasTouch: false}),
  narrow: Object.freeze({width: 320, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false}),
});
const LIMITS = Object.freeze({requests: 2000, concurrent: 32, networkBytes: 64 * 1024 * 1024,
  fileBytes: 8 * 1024 * 1024, requestBytes: 1024 * 1024, captures: 32,
  captureBytes: 8 * 1024 * 1024, totalCaptureBytes: 32 * 1024 * 1024,
  readChars: 24000, readNodes: 600, textElements: 5000, operationMs: 10000});
const TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon',
  '.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8',
  '.csv':'text/csv; charset=utf-8'};
const within = (root, target) => target === root || target.startsWith(root + path.sep);
const jsonResult = value => ({content:[{type:'text',text:JSON.stringify(value)}],details:value});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function boundedString(value, name, max = 512) {
  if (typeof value !== 'string' || !value.length || value.length > max) throw new Error(`Invalid ${name}`);
  return value;
}
function loopbackOrigin(value) {
  const u = new URL(value);
  if (u.protocol !== 'http:' || !['127.0.0.1','localhost','[::1]'].includes(u.hostname) ||
      u.username || u.password || u.pathname !== '/' || u.search || u.hash) {
    throw new Error('allowedOrigin must be an exact HTTP loopback origin, without a path or credentials');
  }
  return u.origin;
}
async function digestFile(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest('hex');
}
async function installedPuppeteer(explicit) {
  const require = createRequire(import.meta.url);
  let packageFile = explicit || process.env.PECCABLE_CODING_AGENT_PACKAGE;
  if (!packageFile) {
    try { packageFile = require.resolve('@oh-my-pi/pi-coding-agent/package.json'); }
    catch { packageFile = path.join(homedir(), '.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/package.json'); }
  }
  packageFile = await realpath(packageFile);
  const agent = JSON.parse(await readFile(packageFile, 'utf8'));
  if (agent.name !== '@oh-my-pi/pi-coding-agent' || agent.dependencies?.['puppeteer-core'] !== VERSION) {
    throw new Error(`Expected installed coding-agent with puppeteer-core exactly ${VERSION}`);
  }
  const installedRequire = createRequire(packageFile);
  const metadataPath = installedRequire.resolve('puppeteer-core/package.json');
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  if (metadata.version !== VERSION) throw new Error(`Installed puppeteer-core must be ${VERSION}`);
  const entry = installedRequire.resolve('puppeteer-core');
  const {default: puppeteer} = await import(pathToFileURL(entry).href);
  const transportEntry = installedRequire.resolve('puppeteer-core/internal/node/PipeTransport.js');
  const {PipeTransport} = await import(pathToFileURL(transportEntry).href);
  return {puppeteer, PipeTransport, evidence: {codingAgentPackage:packageFile, codingAgentVersion:agent.version,
    puppeteerVersion:metadata.version, puppeteerEntry:await realpath(entry)}};
}
async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {server.removeListener('error', reject); resolve();});
  });
  return `http://127.0.0.1:${server.address().port}`;
}
function manageServer(server) {
  const sockets = new Set();
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.setTimeout(LIMITS.operationMs, () => socket.destroy());
  });
  server.requestTimeout = LIMITS.operationMs;
  server.headersTimeout = LIMITS.operationMs;
  server.maxHeadersCount = 100;
  return async () => {
    for (const socket of sockets) socket.destroy();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  };
}
async function bubblewrap(executable) {
  if (!path.isAbsolute(boundedString(executable,'bwrapPath',4096))) throw new Error('bwrapPath must be absolute; no auto-install');
  const binary = await realpath(executable);
  await access(binary,fsConstants.X_OK);
  if (!(await stat(binary)).isFile()) throw new Error('bubblewrap executable must be a file');
  const version = await new Promise((resolve,reject) => {
    execFile(binary,['--version'],{cwd:'/',env:{PATH:'/usr/bin:/bin',LANG:'C'},
      timeout:LIMITS.operationMs,maxBuffer:8192},(error,stdout,stderr) => {
      if (error) reject(new Error(`Cannot obtain bubblewrap version: ${stderr || error.message}`,{cause:error}));
      else resolve(stdout.trim());
    });
  });
  if (!/^bubblewrap \d+\.\d+/.test(version)) throw new Error('bwrapPath did not identify itself as bubblewrap');
  return {binary,version};
}
async function namespaceProcesses(namespace) {
  const pids = [];
  for (const entry of await readdir('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      if (await readlink(`/proc/${entry}/ns/pid`) === namespace) pids.push(Number(entry));
    } catch (error) {
      if (!['ENOENT','ESRCH','EACCES','EPERM'].includes(error.code)) throw error;
    }
  }
  return pids;
}

async function dimensions(page) {
  return page.evaluate(() => ({url:location.href, innerWidth, innerHeight,
    devicePixelRatio, visualViewport:window.visualViewport ? {
      width:visualViewport.width, height:visualViewport.height, scale:visualViewport.scale} : null,
    documentWidth:document.documentElement.scrollWidth, documentHeight:document.documentElement.scrollHeight}));
}

/** Returns observed before/after data, not a claim that the artifact passed. */
export async function scaleText(page, factor = 2) {
  if (factor !== 2) throw new Error('The frozen pilot text-resize factor is exactly 2');
  const previous = await resetTextScale(page);
  return page.evaluate(async max => {
    if (window.__peccableTextResize) throw new Error('Concurrent text-resize snapshots are not supported');
    await document.fonts.ready;
    const elements = [...document.querySelectorAll('*')];
    if (elements.length > max) throw new Error('Text-resize snapshot element bound exceeded');
    const entries = [];
    const pseudo = [];
    // Read author font sources without removing the active overlay. Ratios alone
    // cannot reveal a data/class-selected font hidden by our inline !important.
    const readFontSources = () => {
      const rules = [], registrations = [], uncertainty = [], custom = new Set();
      let visited = 0;
      const fontProperty = property => property === 'line-height' || property === 'font-size';
      const variables = value => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]);
      const declarations = style => [...style].map(property =>
        [property,style.getPropertyValue(property),style.getPropertyPriority(property)]);
      const visit = (list, source) => {
        for (const [index, rule] of [...list].entries()) {
          const location = `${source}/${index}`;
          if (++visited > max) {uncertainty.push({source,reason:'Font-source rule bound exceeded'});return;}
          if (rule instanceof CSSMediaRule && !matchMedia(rule.conditionText).matches) continue;
          if (rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)) continue;
          if (rule instanceof CSSImportRule) {
            if (rule.media.mediaText && !matchMedia(rule.media.mediaText).matches) continue;
            if (rule.supportsText && !CSS.supports(rule.supportsText)) continue;
            try {visit(rule.styleSheet.cssRules,location);}
            catch (error) {uncertainty.push({source:location,reason:String(error)});}
          } else if (rule instanceof CSSStyleRule) {
            rules.push({source:location,selector:rule.selectorText,declarations:declarations(rule.style)});
            if (rule.cssRules.length) visit(rule.cssRules,location);
          } else if (rule.constructor.name === 'CSSPropertyRule') {
            registrations.push({source:location,name:rule.name,syntax:rule.syntax,
              inherits:rule.inherits,initialValue:rule.initialValue});
          } else if (rule.cssRules) {
            if (!(rule instanceof CSSMediaRule) && !(rule instanceof CSSSupportsRule) &&
                rule.constructor.name !== 'CSSLayerBlockRule') {
              if (/font|line-height|--/.test(rule.cssText)) uncertainty.push({
                source:location,reason:`Unsupported font-source group: ${rule.constructor.name}`});
            } else visit(rule.cssRules,location);
          }
        }
      };
      const sheets = [...document.styleSheets,...document.adoptedStyleSheets].filter(value => value !== sheet);
      for (const [index, source] of sheets.entries()) {
        if (source.disabled || (source.media?.mediaText && !matchMedia(source.media.mediaText).matches)) continue;
        try {visit(source.cssRules,`stylesheet-${index}`);}
        catch (error) {uncertainty.push({source:source.href || `stylesheet-${index}`,reason:String(error)});}
      }
      const inline = entries.map(entry => {
        const values = new Map(declarations(entry.element.style).map(value => [value[0],value]));
        for (const [property, owned] of Object.entries(entry.owned)) {
          if (entry.element.style.getPropertyValue(property) === owned &&
              entry.element.style.getPropertyPriority(property) === 'important') {
            const saved = entry.saved[property];
            if (saved.value) values.set(property,[property,saved.value,saved.priority]);
            else values.delete(property);
          }
        }
        return [...values.values()];
      });
      const all = [...rules.map(rule => rule.declarations),...inline].flat();
      for (const [property,value] of all) if (fontProperty(property)) {
        for (const variable of variables(value)) custom.add(variable);
      }
      // Follow only custom properties referenced by a font declaration (including
      // transitive var() fallbacks), not arbitrary color/layout app mutations.
      for (const property of custom) for (const [name,value] of all) if (name === property) {
        for (const variable of variables(value)) custom.add(variable);
      }
      const relevant = values => values.filter(([property]) => fontProperty(property) || custom.has(property));
      for (const [property,value] of relevant(all)) if (/\battr\(|(?:\d|\.)cq(?:w|h|i|b|min|max)\b/i.test(value)) {
        uncertainty.push({source:'font-declaration',property,value,
          reason:'Attribute/container-dependent font sources require a baseline mechanism not covered by this signature'});
      }
      const fontRules = rules.map(rule => ({...rule,declarations:relevant(rule.declarations),
        elementSelector:rule.selector.replace(/::(?:before|after|marker)\b/g,'')}))
        .filter(rule => {
          if (!rule.declarations.length) return false;
          try {document.documentElement.matches(rule.elementSelector);return true;}
          catch (error) {uncertainty.push({source:rule.source,reason:String(error)});return false;}
        });
      const sources = entries.map((entry,index) => {
        const matched = [];
        for (const rule of fontRules) {
          // Generated text uses the originating element's selector. Other
          // pseudo-elements are outside the controlled before/after/marker set.
          if (entry.element.matches(rule.elementSelector)) matched.push(rule);
        }
        return {index:entry.index,inline:relevant(inline[index]).sort((a,b) => a[0].localeCompare(b[0])),rules:matched,
          registrations:registrations.filter(registration => custom.has(registration.name))};
      });
      // Authored values and registration metadata remain stable when our root
      // font overlay canonicalizes a registered rem value to a different px value.
      // CSS.registerProperty registrations are immutable and have no read API;
      // their authored dependencies are still covered by the declarations above.
      const semantic = sources.map(source => ({index:source.index,inline:source.inline,
        rules:source.rules.map(({selector,declarations}) => ({selector,declarations})),
        registrations:source.registrations.map(({name,syntax,inherits,initialValue}) =>
          ({name,syntax,inherits,initialValue}))}));
      return {coverage:'Ordered matched author font-size/line-height declarations, authored custom-property dependencies and CSS registration metadata; no general cascade replay',
        sources,semantic,uncertainty,viewport:{width:innerWidth,height:innerHeight}};
    };
    const token = `pilot-text-${crypto.randomUUID()}`;
    const sheet = new CSSStyleSheet();
    for (const [index, element] of elements.entries()) {
      const computed = getComputedStyle(element);
      const saved = {};
      for (const property of ['font-size','line-height']) saved[property] = {
        value:element.style.getPropertyValue(property), priority:element.style.getPropertyPriority(property)};
      entries.push({element,parent:element.parentNode,index,tag:element.tagName.toLowerCase(), id:element.id,
        beforeFont:parseFloat(computed.fontSize), beforeLine:computed.lineHeight, saved, owned:{}});
      for (const kind of ['::before','::after','::marker']) {
        const style = getComputedStyle(element, kind);
        if ((kind === '::marker' && computed.display === 'list-item') ||
            (kind !== '::marker' && style.content !== 'none' && style.content !== 'normal')) {
          pseudo.push({element,index,kind,beforeFont:parseFloat(style.fontSize),beforeLine:style.lineHeight});
        }
      }
    }
    const fontSources = readFontSources();
    // All measurements precede ALL writes, including those on ancestors.
    const attr = `data-${token}`;
    const setOwned = (entry, property, value) => {
      entry.element.style.setProperty(property,value,'important');
      entry.owned[property] = entry.element.style.getPropertyValue(property);
    };
    for (const entry of entries) {
      if (Number.isFinite(entry.beforeFont)) setOwned(entry,'font-size',`${entry.beforeFont * 2}px`);
      if (entry.beforeLine !== 'normal' && Number.isFinite(parseFloat(entry.beforeLine))) {
        setOwned(entry,'line-height',`${parseFloat(entry.beforeLine) * 2}px`);
      }
    }
    for (const entry of pseudo) {
      entry.element.setAttribute(attr, String(entry.index));
      const line = entry.beforeLine === 'normal' ? 'normal' : `${parseFloat(entry.beforeLine) * 2}px`;
      sheet.insertRule(`[${attr}="${entry.index}"]${entry.kind}{font-size:${entry.beforeFont * 2}px!important;line-height:${line}!important}`);
    }
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    window.__peccableTextResize = {entries,pseudo,attr,sheet,at:performance.now(),readFontSources,fontSources};
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {method:'computed-font-snapshot-css-px', factor:2, browserZoomChanged:false,
      snapshotId:token,elementCount:entries.length,pseudoCount:pseudo.length,fontSources};
  }, LIMITS.textElements).then(async summary => ({...summary,
    replacedPreviousSnapshot:previous.reset,preservedInlineMutations:previous.preservedMutations || 0,observation:await observeTextScale(page)}));
}

/** Ensure, rather than force, 2x. Reuse performs reads only; rebases stay explicit. */
export async function ensureTextScale(page, factor = 2) {
  if (factor !== 2) throw new Error('The frozen pilot text-resize factor is exactly 2');
  const active = await page.evaluate(() => Boolean(window.__peccableTextResize));
  const previousObservation = active ? await observeTextScale(page) : null;
  if (previousObservation?.verified) return {
    method:previousObservation.method,factor:2,browserZoomChanged:false,
    snapshotId:previousObservation.snapshotId,elementCount:previousObservation.elements.length,
    pseudoCount:previousObservation.pseudo.length,status:'reused',reusedSnapshot:true,
    replacedPreviousSnapshot:false,preservedInlineMutations:0,
    observation:previousObservation,verified:true,
  };
  const scrollState = active ? await page.evaluateHandle(() => ({
    active:document.activeElement,window:{x:scrollX,y:scrollY},
    elements:[...document.querySelectorAll('*')].filter(element =>
      element.scrollTop || element.scrollLeft || element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
      .map(element => ({element,top:element.scrollTop,left:element.scrollLeft})),
  })) : null;
  try {
    const snapshot = await scaleText(page,factor);
    const scrollPreservation = scrollState ? await page.evaluate(saved => {
      const elements = saved.elements.map(({element,top,left}) => {
        if (!element.isConnected) return {id:element.id,tag:element.tagName,connected:false,before:{top,left}};
        if (element.scrollTop !== top || element.scrollLeft !== left) element.scrollTo({top,left,behavior:'instant'});
        return {id:element.id,tag:element.tagName,connected:true,before:{top,left},after:{top:element.scrollTop,left:element.scrollLeft}};
      });
      if (scrollX !== saved.window.x || scrollY !== saved.window.y) window.scrollTo({left:saved.window.x,top:saved.window.y,behavior:'instant'});
      return {scope:'Preserve scroll positions recorded immediately before resetting the measurement overlay. No focus calls or scrollIntoView; actual geometric clamping is retained.',
        activeUnchanged:document.activeElement === saved.active,window:{before:saved.window,after:{x:scrollX,y:scrollY}},elements};
    },scrollState) : null;
    const observation = scrollState ? await observeTextScale(page) : snapshot.observation;
    return {...snapshot,observation,status:'rebased',reusedSnapshot:false,
      rebaseReason:active ? 'current snapshot no longer verifies the current font baseline and DOM' : 'no active snapshot',
      previousObservation,scrollPreservation,verified:observation.verified};
  } finally {await scrollState?.dispose();}
}

export async function observeTextScale(page) {
  return page.evaluate(() => {
    const state = window.__peccableTextResize;
    if (!state) throw new Error('No controlled text snapshot is active');
    const collect = (entry, kind) => {
      const style = getComputedStyle(entry.element, kind);
      const afterFont = parseFloat(style.fontSize);
      return {index:entry.index,tag:entry.element.tagName.toLowerCase(),id:entry.element.id,
        pseudo:kind || null,connected:entry.element.isConnected,
        beforeFontPx:entry.beforeFont,afterFontPx:afterFont,
        ratio:entry.beforeFont ? afterFont / entry.beforeFont : null,
        beforeLineHeight:entry.beforeLine,afterLineHeight:style.lineHeight};
    };
    const elements = state.entries.map(entry => collect(entry));
    const pseudo = state.pseudo.map(entry => collect(entry, entry.kind));
    const baselineElements = new Set(state.entries.map(entry => entry.element));
    const currentSources = state.readFontSources();
    const fontSourceChanges = currentSources.sources.filter((source,index) =>
      JSON.stringify(currentSources.semantic[index]) !== JSON.stringify(state.fontSources.semantic[index])).map(source =>
      ({index:source.index,before:state.fontSources.sources[source.index],after:source}));
    const fontSourceUncertainty = [
      ...state.fontSources.uncertainty.map(value => ({phase:'baseline',...value})),
      ...currentSources.uncertainty.map(value => ({phase:'current',...value})),
    ];
    const viewportChanged = currentSources.viewport.width !== state.fontSources.viewport.width ||
      currentSources.viewport.height !== state.fontSources.viewport.height;
    const inlineMutations = state.entries.flatMap(entry => Object.entries(entry.owned).filter(([property,owned]) =>
      entry.element.style.getPropertyValue(property) !== owned ||
      entry.element.style.getPropertyPriority(property) !== 'important').map(([property,owned]) => ({
        index:entry.index,property,owned,value:entry.element.style.getPropertyValue(property),
        priority:entry.element.style.getPropertyPriority(property)})));
    const addedElementCount = [...document.querySelectorAll('*')].filter(element => !baselineElements.has(element)).length;
    const disconnectedElementCount = elements.filter(entry => !entry.connected).length;
    const reparentedElements = state.entries.filter(entry => entry.element.isConnected &&
      entry.element.parentNode !== entry.parent).map(entry => ({index:entry.index,id:entry.element.id}));
    const mismatches = [...elements,...pseudo].filter(entry => entry.connected &&
      (!Number.isFinite(entry.beforeFontPx) || !Number.isFinite(entry.afterFontPx) ||
        (entry.beforeFontPx === 0 ? entry.afterFontPx !== 0 : Math.abs(entry.ratio - 2) > 0.02)));
    const pseudoChanges = [];
    const baselinePseudo = new Set(state.pseudo.map(entry => `${entry.index}:${entry.kind}`));
    for (const entry of state.entries) if (entry.element.isConnected) {
      const computed = getComputedStyle(entry.element);
      for (const kind of ['::before','::after','::marker']) {
        const style = getComputedStyle(entry.element,kind);
        const present = kind === '::marker' ? computed.display === 'list-item' :
          style.content !== 'none' && style.content !== 'normal';
        const snapshotted = baselinePseudo.has(`${entry.index}:${kind}`);
        if (present !== snapshotted) pseudoChanges.push({index:entry.index,kind,present,snapshotted});
      }
    }
    return {method:'computed-font-snapshot-css-px',factor:2,at:performance.now(),
      snapshotId:state.attr.slice(5),addedElementCount,disconnectedElementCount,mismatches,
      fontSourceChanges,fontSourceUncertainty,viewportChanged,inlineMutations,pseudoChanges,reparentedElements,
      verified:addedElementCount === 0 && disconnectedElementCount === 0 && reparentedElements.length === 0 && mismatches.length === 0 &&
        fontSourceChanges.length === 0 && fontSourceUncertainty.length === 0 && !viewportChanged &&
        inlineMutations.length === 0 && pseudoChanges.length === 0,
      elements,pseudo,viewport:{innerWidth,innerHeight,devicePixelRatio,
        visualScale:visualViewport?.scale ?? null}};
  });
}

export async function resetTextScale(page) {
  return page.evaluate(() => {
    const state = window.__peccableTextResize;
    if (!state) return {reset:false,reason:'no active snapshot'};
    let preservedMutations=0;
    for (const entry of state.entries) {
      for (const [property,owned] of Object.entries(entry.owned)) {
        // Restore only the overlay still owned by this snapshot, not later app writes.
        if (entry.element.style.getPropertyValue(property)!==owned ||
            entry.element.style.getPropertyPriority(property)!=='important') {preservedMutations++;continue;}
        const saved=entry.saved[property];
        if (saved.value) entry.element.style.setProperty(property,saved.value,saved.priority);
        else entry.element.style.removeProperty(property);
      }
      entry.element.removeAttribute(state.attr);
    }
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== state.sheet);
    delete window.__peccableTextResize;
    return {reset:true,restoredElements:state.entries.length,preservedMutations};
  });
}

/** Fresh owned Chrome, profile, static preview and bounded author tool facade. */
export async function startBrowser({workspace, scratch, allowedOrigin, executablePath, codingAgentPackage, bwrapPath = '/usr/bin/bwrap', navigateOnStart = true} = {}) {
  if (process.platform !== 'linux') throw new Error('Pilot browser ownership is implemented for Linux only');
  if (typeof navigateOnStart !== 'boolean') throw new Error('navigateOnStart must be a boolean');
  const root = await realpath(boundedString(workspace, 'workspace', 4096));
  if (!(await stat(root)).isDirectory()) throw new Error('workspace must be a directory');
  await mkdir(boundedString(scratch, 'scratch', 4096), {recursive:true,mode:0o700});
  const scratchRoot = await realpath(scratch);
  if (within(root,scratchRoot) || within(scratchRoot,root)) throw new Error('workspace and scratch must be disjoint');
  const configuredExecutable = executablePath || process.env.PECCABLE_BROWSER_EXECUTABLE || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!configuredExecutable || !path.isAbsolute(configuredExecutable)) throw new Error('Set absolute executablePath or PECCABLE_BROWSER_EXECUTABLE/PUPPETEER_EXECUTABLE_PATH; no auto-install');
  const binary = await realpath(configuredExecutable);
  await access(binary, fsConstants.X_OK);
  if (!(await stat(binary)).isFile()) throw new Error('Browser executable must be a file');
  const {puppeteer,PipeTransport,evidence:dependencyEvidence} = await installedPuppeteer(codingAgentPackage);
  const binarySha256 = await digestFile(binary);
  const wrapper = await bubblewrap(bwrapPath);
  const browserDirectory = path.dirname(binary);
  const harnessRoot = await realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
  const hostHome = await realpath(homedir());
  const mounts = [];
  for (const destination of ['/usr','/lib','/lib64','/bin','/etc/fonts','/etc/ld.so.cache','/var/cache/fontconfig']) {
    let source;
    try {source = await realpath(destination);}
    catch (error) {
      if (error.code === 'ENOENT' && !['/usr','/lib','/lib64','/bin'].includes(destination)) continue;
      throw error;
    }
    mounts.push({type:'read-only',source,destination});
  }
  mounts.push({type:'read-only',source:browserDirectory,destination:browserDirectory});
  for (const {source} of mounts) {
    if (within(source,hostHome) || [root,harnessRoot,scratchRoot].some(protectedRoot =>
      within(source,protectedRoot) || within(protectedRoot,source))) {
      throw new Error(`Browser read-only mount would expose a protected host tree: ${source}`);
    }
  }
  const owned = await mkdtemp(path.join(scratchRoot,'pilot-browser-'));
  const profile = path.join(owned,'profile');
  const home = path.join(owned,'home');
  const tmp = path.join(owned,'tmp');
  const isolatedProfile = '/p', isolatedHome = '/h', isolatedTmp = '/t';
  for (const [source,destination] of [[profile,isolatedProfile],[home,isolatedHome],[tmp,isolatedTmp]]) {
    mounts.push({type:'read-write',source,destination});
  }
  mounts.unshift({type:'proc',destination:'/proc'},{type:'dev',destination:'/dev'},{type:'tmpfs',destination:'/tmp'});
  let browser, page, context, chrome, closing, disconnected = false, wrapperClosed = false;
  let transport, sandboxPid, sandboxNamespace, namespaceEvidence;
  let chromeStderr = Buffer.alloc(0);
  let statusBuffer = '';
  let stopStatic = async () => {}, stopProxy = async () => {};
  let requests = 0, active = 0, networkBytes = 0, captures = 0, captureBytes = 0;
  const blocked = [];
  const handlers = new Map();
  const recordBlocked = (url,reason) => {if (blocked.length < 100) blocked.push({url:String(url).slice(0,1024),reason});};
  function killOwned() {
    if (!chrome?.pid) return;
    try {process.kill(-chrome.pid,'SIGKILL');} catch (error) {
      if (error.code !== 'ESRCH') {try {chrome.kill('SIGKILL');} catch { /* Already exited. */ }}
    }
  }
  async function close() {
    if (closing) return closing;
    closing = (async () => {
      let cleanupError;
      try {
        if (browser && !disconnected) {
          await Promise.race([browser.close().catch(error => {cleanupError = error;}),delay(3000)]);
        }
        killOwned();
        transport?.close();
        const deadline = Date.now() + 3000;
        while ((chrome && !wrapperClosed) ||
          (sandboxNamespace && (await namespaceProcesses(sandboxNamespace)).length)) {
          if (Date.now() >= deadline) throw new Error('Owned browser wrapper/namespace did not exit; profile retained for owner cleanup');
          killOwned();
          await delay(25);
        }
        await Promise.all([stopProxy(),stopStatic()]);
        await rm(owned,{recursive:true,force:true,maxRetries:3,retryDelay:100});
      } finally {
        await Promise.all([stopProxy(),stopStatic()]);
        for (const [name,handler] of handlers) process.removeListener(name,handler);
      }
      if (cleanupError) throw cleanupError;
    })();
    return closing;
  }
  for (const [name,code] of [['SIGINT',130],['SIGTERM',143],['SIGHUP',129]]) {
    const handler = () => {void close().catch(error => console.error('Browser cleanup failed:',error)).finally(() => process.exit(code));};
    handlers.set(name,handler); process.once(name,handler);
  }
  const exitHandler = () => {killOwned();};
  handlers.set('exit',exitHandler); process.once('exit',exitHandler);
  // Preserve fatal-error termination, but first retire this trial's resources.
  for (const name of ['uncaughtException','unhandledRejection']) {
    const handler = error => {
      console.error('Fatal error while owning a pilot browser:', error);
      void close().catch(cleanup => console.error('Browser cleanup failed:',cleanup))
        .finally(() => process.exit(1));
    };
    handlers.set(name,handler); process.once(name,handler);
  }
  try {
    await mkdir(profile,{mode:0o700});
    await mkdir(home,{mode:0o700});
    await mkdir(tmp,{mode:0o700});
    const staticServer = createServer(async (req,res) => {
      res.setHeader('Cache-Control','no-store, max-age=0');
      res.setHeader('Pragma','no-cache');
      res.setHeader('X-Content-Type-Options','nosniff');
      try {
        if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
        const pathname = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
        if (pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {res.writeHead(403);res.end();return;}
        let filename = await realpath(path.resolve(root, `.${pathname}`));
        if (!within(root,filename)) {res.writeHead(403);res.end();return;}
        if ((await stat(filename)).isDirectory()) filename = await realpath(path.join(filename,'index.html'));
        if (!within(root,filename)) {res.writeHead(403);res.end();return;}
        const file = await open(filename,fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);
        try {
          // Recheck the opened descriptor, not a raceable pathname. Intermediary
          // symlink swaps must not turn the preview into a host-file reader.
          const openedPath = await realpath(`/proc/self/fd/${file.fd}`);
          if (!within(root,openedPath)) {res.writeHead(403);res.end();return;}
          const info = await file.stat();
          if (!info.isFile() || info.size > LIMITS.fileBytes) {res.writeHead(413);res.end();return;}
          res.writeHead(200,{'Content-Type':TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream','Content-Length':info.size});
          if (req.method === 'HEAD') res.end();
          else await new Promise(resolve => {
            const stream = file.createReadStream({autoClose:false});
            stream.on('error',() => {res.destroy();resolve();});
            res.on('close',() => {stream.destroy();resolve();});
            res.on('finish',resolve); stream.pipe(res);
          });
        } finally {await file.close();}
      } catch (error) {if (!res.headersSent) res.writeHead(error.code === 'ENOENT' ? 404 : 400);res.end();}
    });
    stopStatic = manageServer(staticServer);
    const origin = await listen(staticServer);
    const origins = new Set([origin]);
    if (allowedOrigin) origins.add(loopbackOrigin(allowedOrigin));
    const permitted = value => {try {const u = new URL(value);return u.protocol === 'http:' && !u.username && !u.password && origins.has(u.origin);} catch {return false;}};
    const proxy = createServer((req,res) => {
      if (++requests > LIMITS.requests || active >= LIMITS.concurrent || networkBytes >= LIMITS.networkBytes || !permitted(req.url)) {
        recordBlocked(req.url,'origin or resource bound');res.writeHead(403);res.end();return;
      }
      const target = new URL(req.url);
      const headers = {...req.headers,host:target.host};
      delete headers['proxy-authorization'];delete headers['proxy-connection'];
      // Normalize localhost to a numeric address: no DNS or rebinding.
      const hostname = target.hostname === 'localhost' ? '127.0.0.1' : target.hostname.replace(/^\[|\]$/g,'');
      active++;
      let released = false, received = 0;
      const release = () => {if (!released) {released = true;active--;}};
      const upstream = httpRequest({hostname,port:target.port || 80,path:target.pathname + target.search,
        method:req.method,headers,timeout:LIMITS.operationMs,agent:false}, response => {
        const responseHeaders = {...response.headers,'cache-control':'no-store, max-age=0'};
        delete responseHeaders['set-cookie2'];
        res.writeHead(response.statusCode || 502,responseHeaders);
        response.on('data',chunk => {
          networkBytes += chunk.length;
          if (networkBytes > LIMITS.networkBytes) {upstream.destroy();res.destroy();}
        });
        response.on('error',() => res.destroy());
        response.pipe(res);
      });
      upstream.on('timeout',() => upstream.destroy(new Error('Proxy deadline')));
      upstream.on('error',() => {if (!res.headersSent) res.writeHead(502);res.end();release();});
      req.on('data',chunk => {received += chunk.length;networkBytes += chunk.length;
        if (received > LIMITS.requestBytes || networkBytes > LIMITS.networkBytes) {upstream.destroy();req.destroy();}});
      req.on('error',() => upstream.destroy());
      res.on('close',() => {upstream.destroy();release();});
      req.pipe(upstream);
    });
    proxy.on('connect',(req,socket) => {recordBlocked(req.url,'CONNECT denied');socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');});
    proxy.on('upgrade',(req,socket) => {recordBlocked(req.url,'WebSocket denied');socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');});
    stopProxy = manageServer(proxy);
    const proxyOrigin = await listen(proxy);
    const args = [
      `--proxy-server=${proxyOrigin}`,'--proxy-bypass-list=<-loopback>',
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE [::1]',
      '--disable-quic','--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
      '--disable-background-networking','--disable-component-update','--disable-sync',
      '--disable-extensions','--no-first-run','--no-default-browser-check',
      '--disable-features=MediaRouter,OptimizationHints,DnsOverHttps',
      '--force-device-scale-factor=1','--window-size=1440,1000','--lang=en-US',
    ];
    // Own the wrapper before CDP setup. Chrome is never spawned directly: a
    // failed namespace/mount setup must fail closed, not retry on the host.
    const launchArgs = [...(await puppeteer.defaultArgs({headless:true,userDataDir:isolatedProfile,args}))
      .filter(arg => arg !== '--hide-scrollbars' && arg !== '--no-sandbox'),
      '--no-sandbox','--remote-debugging-pipe'];
    const environment = {PATH:'/usr/bin:/bin',HOME:isolatedHome,TMPDIR:isolatedTmp,XDG_RUNTIME_DIR:isolatedTmp,
      XDG_CONFIG_HOME:path.join(isolatedHome,'.config'),XDG_CACHE_HOME:path.join(isolatedHome,'.cache'),LANG:'en_US.UTF-8',TZ:'UTC'};
    // Owner's installed-bwrap probe confirmed that inherited, non-CLOEXEC
    // descriptors survive by default. That version has no --preserve-fds flag.
    const outerArgs = ['--die-with-parent','--new-session','--unshare-user','--unshare-pid',
      '--unshare-ipc','--unshare-uts','--cap-drop','ALL',
      '--json-status-fd','5','--clearenv'];
    for (const [name,value] of Object.entries(environment)) outerArgs.push('--setenv',name,value);
    for (const mount of mounts) {
      if (mount.source) outerArgs.push(mount.type === 'read-only' ? '--ro-bind' : '--bind',mount.source,mount.destination);
      else outerArgs.push(`--${mount.type}`,mount.destination);
    }
    outerArgs.push('--remount-ro','/','--chdir',isolatedHome,'--',binary,...launchArgs);
    chrome = spawn(wrapper.binary,outerArgs,{detached:true,cwd:home,
      stdio:['ignore','ignore','pipe','pipe','pipe','pipe'],env:environment});
    chrome.once('close',() => {wrapperClosed = true;});
    // Retain only the final 8 KiB; this includes bubblewrap setup errors.
    chrome.stderr.on('data',chunk => {
      const tail = chunk.subarray(-8192);
      chromeStderr = Buffer.concat([chromeStderr.subarray(Math.max(0,chromeStderr.length + tail.length - 8192)),tail]);
    });
    await new Promise((resolve,reject) => {
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true;clearTimeout(timer);
        chrome.removeListener('error',failed);chrome.removeListener('exit',exited);
        if (error) reject(error);else resolve();
      };
      const failed = error => finish(error);
      const exited = (code,signal) => finish(new Error(`Browser wrapper exited before isolation setup (${signal || code})`));
      const timer = setTimeout(() => finish(new Error('Browser wrapper isolation setup timed out')),LIMITS.operationMs);
      chrome.once('error',failed);chrome.once('exit',exited);
      chrome.stdio[5].on('data',chunk => {
        statusBuffer += chunk.toString('utf8');
        if (statusBuffer.length > 8192) {finish(new Error('Browser wrapper status bound exceeded'));return;}
        let newline;
        while ((newline = statusBuffer.indexOf('\n')) !== -1) {
          const line = statusBuffer.slice(0,newline);statusBuffer = statusBuffer.slice(newline + 1);
          try {
            const status = JSON.parse(line);
            if (Number.isSafeInteger(status['pid-namespace'])) sandboxNamespace = `pid:[${status['pid-namespace']}]`;
            if (Number.isSafeInteger(status['child-pid']) && status['child-pid'] > 0) {
              sandboxPid = status['child-pid'];finish();
            }
          } catch (error) {finish(new Error('Invalid browser wrapper status',{cause:error}));}
        }
      });
    });
    if (!chrome.pid || !sandboxPid) throw new Error('Dedicated browser wrapper ownership unavailable');
    namespaceEvidence = {};
    for (const name of ['mnt','user','pid','ipc','uts']) {
      const observed = await readlink(`/proc/${sandboxPid}/ns/${name}`);
      const owner = await readlink(`/proc/self/ns/${name}`);
      if (observed === owner) throw new Error(`Browser wrapper did not isolate the ${name} namespace`);
      namespaceEvidence[name] = {owner,browser:observed};
      if (name === 'pid') sandboxNamespace = observed;
    }
    transport = new PipeTransport(chrome.stdio[3],chrome.stdio[4]);
    browser = await puppeteer.connect({transport,defaultViewport:VIEWPORTS.wide,protocolTimeout:15000});
    browser.on('disconnected',() => {disconnected = true;void close().catch(() => {});});
    context = await browser.createBrowserContext({downloadBehavior:{policy:'deny'}});
    page = await context.newPage();
    page.setDefaultTimeout(LIMITS.operationMs);
    page.setDefaultNavigationTimeout(LIMITS.operationMs);
    await page.setCacheEnabled(false);
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request',request => {
      const url = request.url();
      const localResource = /^(data:|blob:)/.test(url) && !request.isNavigationRequest();
      void (permitted(url) || localResource ? request.continue() : request.abort('blockedbyclient'))
        .catch(() => {});
      if (!permitted(url) && !localResource) recordBlocked(url,'page origin allowlist');
    });
    page.on('dialog',dialog => {void dialog.dismiss().catch(() => {});});
    // Popups are not a second author channel; all browser traffic still uses the proxy.
    browser.on('targetcreated',target => {if (target.type() === 'page') {
      void target.page().then(popup => {if (popup && popup !== page) return popup.close();}).catch(() => {});
    }});
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
    await cdp.send('Emulation.setLocaleOverride',{locale:'en-US'});
    await cdp.send('Emulation.setTimezoneOverride',{timezoneId:'UTC'});
    await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
    await page.goto(navigateOnStart ? origin : 'about:blank',{waitUntil:'domcontentloaded'});
    const initialDimensions = await dimensions(page);
    const version = await browser.version();
    const observedEnvironment = await page.evaluate(() => ({
      locale:Intl.DateTimeFormat().resolvedOptions().locale,
      timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      language:navigator.language,
      light:matchMedia('(prefers-color-scheme: light)').matches,
    }));
    if (observedEnvironment.locale !== 'en-US' || observedEnvironment.timezone !== 'UTC' ||
        observedEnvironment.language !== 'en-US' || !observedEnvironment.light) throw new Error('Browser environment differs from frozen en-US/UTC/light settings');
    const configuration = {dependency:dependencyEvidence,browserVersion:version,binary,binarySha256,
      profile,ownedDirectory:owned,chromePid:sandboxPid,wrapperPid:chrome.pid,origin,allowedOrigins:[...origins],
      outerSandbox:{kind:'bwrap',binary:wrapper.binary,version:wrapper.version,
        command:[wrapper.binary,...outerArgs],mounts,namespaces:namespaceEvidence,
        preservedDescriptors:[3,4],descriptorPolicy:'inherited non-CLOEXEC FDs preserved by installed bubblewrap; owner probe wrote FD_READY through inherited fd 10',
        descriptorProbeSource:'owner-reported installed-bwrap probe; no unsupported --preserve-fds flag',statusDescriptor:5,hostNetworkRetained:true,
        chromeSandboxDisabledOnlyInsideWrapper:true},
      headless:true,pipe:true,args:launchArgs,limits:LIMITS,viewports:VIEWPORTS,initialDimensions,observedEnvironment,initialNavigation:navigateOnStart?'app':'about:blank',
      textScaling:'computed-font-snapshot-css-px; factor 2; numeric line height multiplied; normal preserved',
      downloadPolicy:'deny; evaluator may explicitly authorize bounded download inspection using raw page',
      networkPolicy:'exact HTTP loopback origins via dedicated deny-CONNECT/deny-WebSocket proxy; page interception; host network retained, not an OS network ACL',
      isolation:'bubblewrap mount/user/PID/IPC/UTS namespaces; capabilities dropped; read-only system/browser mounts; only owned profile/home/tmp host writes; fresh incognito context'};
    let queue = Promise.resolve();
    const actions = Object.freeze(['navigate','viewport','click','fill','select','keyboard','read','screenshot']);
    async function perform(action,input) {
      if (closing) throw new Error('Browser trial is closed');
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Browser args must be an object');
      switch (action) {
        case 'navigate': {
          const destination = new URL(boundedString(input.path,'path',2048),origin);
          if (!permitted(destination.href)) throw new Error('Navigation outside trial origins denied');
          await page.goto(destination.href,{waitUntil:'domcontentloaded'});
          return jsonResult(await dimensions(page));
        }
        case 'viewport': {
          if (!Object.hasOwn(VIEWPORTS,input.name)) throw new Error('Viewport must be wide or narrow');
          await page.setViewport(VIEWPORTS[input.name]);
          await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
          return jsonResult({name:input.name,requested:VIEWPORTS[input.name],observed:await dimensions(page)});
        }
        case 'click': {
          await page.click(boundedString(input.selector,'selector'));
          return jsonResult({action,url:page.url()});
        }
        case 'fill': {
          const selector = boundedString(input.selector,'selector');
          if (typeof input.value !== 'string' || input.value.length > 10000) throw new Error('Invalid fill value');
          const element = await page.waitForSelector(selector,{visible:true});
          try {
            if (!await element.evaluate(node => node instanceof HTMLTextAreaElement ||
              (node instanceof HTMLInputElement &&
                !['checkbox','radio','file','button','submit','image','reset','hidden'].includes(node.type)))) {
              throw new Error('Fill requires a value-bearing input or textarea; use select/click for other controls');
            }
            // Puppeteer's native-type-aware locator handles date/time inputs;
            // simulated Ctrl+A/type is not equivalent for segmented controls.
            await element.asLocator().fill(input.value);
          } finally {await element?.dispose();}
          return jsonResult({action,url:page.url(),characters:input.value.length});
        }
        case 'select': {
          if (!Array.isArray(input.values) || input.values.length > 100 || input.values.some(value => typeof value !== 'string' || value.length > 1024)) throw new Error('Invalid select values');
          return jsonResult({selected:await page.select(boundedString(input.selector,'selector'),...input.values)});
        }
        case 'keyboard': {
          const pieces = boundedString(input.key,'key',100).split('+');
          const key = pieces.pop();
          const modifiers = [...new Set(pieces)];
          if (modifiers.some(modifier => !['Control','Alt','Shift','Meta'].includes(modifier)) ||
              !/^(?:[a-zA-Z0-9]|Tab|Enter|Space|Escape|Backspace|Delete|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/.test(key)) throw new Error('Unsupported keyboard key');
          try {for (const modifier of modifiers) await page.keyboard.down(modifier);await page.keyboard.press(key);}
          finally {for (const modifier of modifiers.reverse()) await page.keyboard.up(modifier);}
          return jsonResult({key:input.key,url:page.url()});
        }
        case 'read': {
          const selector = input.selector === undefined ? 'body' : boundedString(input.selector,'selector');
          const observation = await page.$eval(selector,(root,limits) => {
            const nodes = [root,...root.querySelectorAll('a,button,input,select,textarea,[role],[tabindex],h1,h2,h3,[aria-live]')];
            const clip = value => String(value || '').slice(0,1024);
            return {url:location.href,title:document.title,text:(root.innerText || root.textContent || '').slice(0,limits.readChars),
              textTruncated:(root.innerText || root.textContent || '').length > limits.readChars,
              nodeCount:nodes.length,nodesTruncated:nodes.length > limits.readNodes,
              nodes:nodes.slice(0,limits.readNodes).map(node => {const rect = node.getBoundingClientRect();return {
                tag:node.tagName.toLowerCase(),id:clip(node.id),role:node.getAttribute('role'),
                name:clip(node.getAttribute('aria-label') || node.getAttribute('alt') || node.innerText || node.textContent),
                value:'value' in node ? clip(node.value) : null,checked:'checked' in node ? node.checked : null,
                disabled:'disabled' in node ? node.disabled : null,expanded:node.getAttribute('aria-expanded'),
                invalid:node.getAttribute('aria-invalid'),focused:node === document.activeElement,
                box:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};})};
          },LIMITS);
          return jsonResult({ ...observation,dimensions:await dimensions(page)});
        }
        case 'screenshot': {
          if (captures >= LIMITS.captures) throw new Error('Capture count bound reached');
          const image = await page.screenshot({type:'png',fullPage:false,captureBeyondViewport:false});
          if (image.length > LIMITS.captureBytes || captureBytes + image.length > LIMITS.totalCaptureBytes) throw new Error('Capture byte bound reached');
          captures++;captureBytes += image.length;
          const observation = {capture:captures,bytes:image.length,sha256:createHash('sha256').update(image).digest('hex'),
            format:'png',scope:'current viewport only; not full scoped-content evidence',dimensions:await dimensions(page)};
          return {content:[{type:'text',text:JSON.stringify(observation)},
            {type:'image',data:Buffer.from(image).toString('base64'),mimeType:'image/png'}],details:observation};
        }
        default: throw new Error('Browser action denied');
      }
    }
    const tools = Object.freeze({actions,invoke(action,input = {},{signal} = {}) {
      if (!actions.includes(action)) return Promise.reject(new Error('Browser action denied'));
      const run = async () => {
        if (signal?.aborted) throw signal.reason || new Error('Browser tool aborted');
        const abort = () => {void close().catch(() => {});};
        signal?.addEventListener('abort',abort,{once:true});
        try {return await perform(action,input);}
        catch (error) {
          // An action failure is evidence, never a source/artifact repair.
          if (!browser.connected) await close().catch(() => {});
          throw error;
        } finally {signal?.removeEventListener('abort',abort);}
      };
      const result = queue.then(run);
      queue = result.catch(() => {});
      return result;
    }});
    return {browser,page,tools,origin,close,
      evidence:async () => ({...configuration,currentDimensions:closing ? null : await dimensions(page),
        counters:{requests,active,networkBytes,captures,captureBytes},blocked:[...blocked],closed:Boolean(closing)})};
  } catch (error) {
    let failure = error;
    try {await close();}
    catch (cleanup) {failure = new AggregateError([error,cleanup],'Browser start and cleanup failed');}
    const stderr = chromeStderr.toString('utf8');
    throw new Error(`${failure.message}${stderr ? `\nBrowser wrapper/Chrome stderr (last 8192 bytes):\n${stderr}` : ''}`,{cause:failure});
  }
}
