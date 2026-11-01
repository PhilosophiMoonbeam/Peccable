// Repository maintenance only. Importing this module performs no collection or provider work.
// collectRecoveryEvidence writes a separately versioned, custodian-only receipt. Release only
// resources explicitly indexed under each artifact; source bindings and failures stay private.
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {appendFile, lstat, mkdir, readFile, readdir, realpath, writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);
const PDF_LIMITS = Object.freeze({bytes:64 * 1024 * 1024, pages:100, timeout:60000});
const AUTHOR_SCOPE = 'Author-time browser observation only; not independent final-artifact proof. Provider inclusion is separately recorded and may be unknown.';
const CLAIM_SCOPE = 'Only the explicitly submitted auxiliary-read claim and recorded delivered excerpts are attested. This does not establish full-file reading, comprehension, use, broader honesty, or final-artifact correctness.';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const digest = value => sha(json(value));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const errorText = error => String(error?.message || error).slice(0,12000);
function ensure(value, message) {if (!value) throw new Error(message);}
function contained(root, target) {const relative=path.relative(root,target);return relative==='' || (!path.isAbsolute(relative) && relative!=='..' && !relative.startsWith(`..${path.sep}`));}
function relativeFile(value) {
  ensure(typeof value==='string' && value.length && !path.isAbsolute(value) && !value.includes('\0') && !value.includes('\\') && value.split('/').every(part=>part && part!=='.' && part!=='..'),'Unsafe relative file reference');
  return value;
}
async function exists(filename) {try {await lstat(filename);return true;} catch(error) {if(error.code==='ENOENT')return false;throw error;}}
async function safePath(root, relative) {
  let target=root;
  for(const part of relativeFile(relative).split('/')) {target=path.join(target,part);ensure(!(await lstat(target)).isSymbolicLink(),'Symlink in source reference');}
  ensure(contained(root,await realpath(target)),'Source reference escapes root');
  return target;
}
async function regularBytes(filename) {const info=await lstat(filename);ensure(info.isFile() && !info.isSymbolicLink(),'Expected regular source file');return readFile(filename);}
async function fileDigest(filename) {const hash=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(filename)){bytes+=chunk.length;hash.update(chunk);}return {bytes,sha256:hash.digest('hex')};}
async function inventory(root, systemFileLinks=false) {
  const files=[],visiting=new Set();
  async function visit(relative) {
    const full=path.join(root,relative);let info=await lstat(full),target;
    if(info.isSymbolicLink()){ensure(systemFileLinks,'Symlink in frozen source');target=await realpath(full);info=await lstat(target);}
    const record={path:relative.split(path.sep).join('/'),...(target?{symlink_target:target}:{})};
    if(info.isDirectory()) {
      const identity=target||full;ensure(!visiting.has(identity),'Inventory link cycle');visiting.add(identity);
      if(target)files.push({...record,type:'directory'});
      try {for(const name of (await readdir(full)).sort())await visit(path.join(relative,name));} finally {visiting.delete(identity);}
    } else {ensure(info.isFile(),'Nonregular frozen source');files.push({...record,...await fileDigest(full)});}
  }
  await visit('');return {sha256:digest(files),files};
}
async function put(filename,value) {await mkdir(path.dirname(filename),{recursive:true,mode:0o700});await writeFile(filename,Buffer.isBuffer(value)||value instanceof Uint8Array?value:typeof value==='string'?value:json(value),{flag:'wx',mode:0o600});}
async function resource(directory,location,kind,scope,value) {
  const filename=path.join(directory,relativeFile(location));await put(filename,value);
  return {location,path:filename,kind,...await fileDigest(filename),scope};
}
async function bounded(promise,milliseconds,label,cancel) {
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>{void Promise.resolve(cancel?.()).catch(()=>{});reject(new Error(`${label} exceeded ${milliseconds}ms`));},milliseconds);})]);}
  finally{clearTimeout(timer);}
}
async function validateManifest(manifestPath,expectedManifestHash) {
  ensure(path.isAbsolute(manifestPath) && /^[a-f0-9]{64}$/.test(expectedManifestHash),'Absolute manifest and expected SHA256 required');
  const resolved=await realpath(manifestPath),bytes=await regularBytes(resolved);
  ensure(sha(bytes)===expectedManifestHash,'Original manifest identity mismatch');
  const manifest=JSON.parse(bytes);
  ensure(manifest.schema_version==='peccable-pilot-manifest-v1' && path.dirname(resolved)===manifest.storage,'Original manifest storage/schema mismatch');
  ensure((await readFile(await safePath(manifest.storage,'manifest.sha256'),'utf8')).trim()===expectedManifestHash,'Original freeze record mismatch');
  ensure(same(await inventory(path.join(manifest.storage,'frozen')),manifest.frozen),'Original frozen source inventory mismatch');
  ensure(manifest.order?.length===63 && new Set(manifest.order.map(row=>row.artifactId)).size===63 && new Set(manifest.order.map(row=>row.taskId)).size===63,'Expected 63 unique frozen slots');
  for(const row of manifest.order)ensure(/^[a-f0-9]{20}$/.test(row.artifactId) && /^[a-f0-9]{20}$/.test(row.taskId) && Number.isInteger(row.briefIndex) && row.briefIndex>=0 && row.briefIndex<7,'Invalid frozen slot');
  for(const name of ['chrome','bwrap'])ensure((await fileDigest(manifest.runtime[name])).sha256===manifest.runtime_files[name].sha256,`Frozen ${name} identity mismatch`);
  for(const name of ['@oh-my-pi/pi-coding-agent','puppeteer-core'])ensure((await fileDigest(path.join(manifest.runtime.modules,name,'package.json'))).sha256===manifest.versions.packages[name].package_sha256,`Frozen package identity mismatch: ${name}`);
  if(manifest.environment.fonts)ensure(same(await inventory('/usr/share/fonts',true),manifest.environment.fonts),'Frozen system font inventory mismatch');
  return {manifest,manifestPath:resolved};
}
async function snapshotSources(out,manifest) {
  const sources={};
  for(const [key,filename] of Object.entries({collector:fileURLToPath(import.meta.url),browser:path.join(HERE,'pilot-browser.mjs'),evaluator:path.join(HERE,'fixtures/pilot-v3-evaluator.mjs'),orchestrator:path.join(HERE,'run-pilot.mjs'),reviewer:path.join(HERE,'review-pilot.mjs')})) {
    const bytes=await regularBytes(filename),snapshot=path.join(out,'sources',key==='evaluator'?'evaluator.mjs':path.basename(filename));
    await put(snapshot,bytes);sources[key]={source:filename,path:snapshot,bytes:bytes.length,sha256:sha(bytes)};
  }
  return sources;
}
async function loadTrial(manifest,hash,row) {
  const root=await safePath(manifest.storage,`trials/${row.taskId}`),attempt=await exists(path.join(root,'attempt-2/outcome.json'))?2:1;
  const base=await safePath(root,`attempt-${attempt}`),outcome=JSON.parse(await regularBytes(await safePath(base,'outcome.json')));
  ensure(outcome.manifest_hash===hash && outcome.taskId===row.taskId && outcome.artifactId===row.artifactId && outcome.arm===row.arm && outcome.briefIndex===row.briefIndex && outcome.repetition===row.repetition,'Original trial identity mismatch');
  if(attempt===2) {const original=JSON.parse(await regularBytes(await safePath(root,'attempt-1/outcome.json')));ensure(original.agent_status==='infrastructure_interrupted' && outcome.retry_reason && original.manifest_hash===hash,'Unregistered original retry');}
  const artifact=await safePath(base,'artifact'),before=await inventory(artifact);
  ensure(same(before,outcome.artifact_hashes),'Original artifact bytes differ from recorded outcome');
  ensure(same(await inventory(await safePath(base,'evidence')),outcome.evidence_hashes),'Original evidence bytes differ from recorded outcome');
  return {base,artifact,before,outcome,attempt};
}
async function readTrace(filename,onMalformed) {
  const records=[];let line=0;
  for await(const text of createInterface({input:createReadStream(filename),crlfDelay:Infinity})) {
    line++;if(!text.trim())continue;
    try {records.push({line,record:JSON.parse(text)});} catch(error) {await onMalformed({line,error:errorText(error)});}
  }
  return records;
}
function successfulTool(records,id) {
  return records.find(({record})=>record.type==='agent_event' && record.event?.type==='tool_execution_end' && record.event.toolCallId===id && record.event.isError===false);
}
function deliveredTool(records,id) {
  return records.find(({record})=>record.type==='agent_event' && record.event?.type==='message_end' && record.event.message?.role==='toolResult' && record.event.message.toolCallId===id && !record.event.message.isError);
}
function outboundImageMatches(record,id,hash) {
  const callId=id.split('|')[0];
  return (record.payload?.input||[]).filter(item=>item.type==='function_call_output' && item.call_id===callId).flatMap(item=>Array.isArray(item.output)?item.output:[]).some(block=>{
    if(block.type!=='input_image' || typeof block.image_url!=='string' || !block.image_url.startsWith('data:image/png;base64,'))return false;
    return sha(Buffer.from(block.image_url.slice('data:image/png;base64,'.length),'base64'))===hash;
  });
}
async function collectAuthorImages(records,directory,item,report) {
  const observations=[];
  for(const {line,record} of records) {
    const event=record.event;
    if(record.type!=='agent_event' || event?.type!=='tool_execution_end' || event.toolName!=='browser' || event.isError!==false)continue;
    const start=records.find(entry=>entry.record.event?.type==='tool_execution_start' && entry.record.event.toolCallId===event.toolCallId);
    if(start?.record.event.toolName!=='browser' || start.record.event.args?.action!=='screenshot')continue;
    for(const [blockIndex,block] of (event.result?.content||[]).entries()) {
      if(block.type!=='image')continue;
      try {
        ensure(block.mimeType==='image/png' && typeof block.data==='string','Author browser image is not a PNG');
        const bytes=Buffer.from(block.data,'base64');
        ensure(bytes.length>=8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Invalid author PNG bytes');
        ensure(bytes.length<=8*1024*1024,'Author PNG exceeds release byte bound');
        const imageHash=sha(bytes),delivery=deliveredTool(records,event.toolCallId);
        const delivered=delivery?.record.event.message.content?.some(candidate=>candidate.type==='image' && candidate.mimeType==='image/png' && sha(Buffer.from(candidate.data,'base64'))===imageHash)===true;
        const payloads=records.filter(entry=>entry.line>line && entry.record.type==='provider_payload' && entry.record.sha256===sha(JSON.stringify(entry.record.payload)) && outboundImageMatches(entry.record,event.toolCallId,imageHash));
        const location=`evidence/recovery-author-${observations.length+1}.png`;
        item.resources.push(await resource(directory,location,'rendered',AUTHOR_SCOPE,bytes));
        observations.push({location,event_id:`author/session.jsonl:line-${line}`,toolCallId:event.toolCallId,tool_start_event_id:`author/session.jsonl:line-${start.line}`,block_index:blockIndex,delivered_to_transcript:delivered,provider_inclusion:{status:delivered&&payloads.length?'included':'unknown',evidence:payloads.map(entry=>({event_id:`author/session.jsonl:line-${entry.line}`,toolCallId:event.toolCallId,match:'Exact PNG bytes in matching outbound function_call_output input_image; payload digest verified.'})),scope:'Recorded outbound provider payload, not proof of provider attention or visual reasoning.'},dimensions:event.result.details?.dimensions||null,capture_scope:event.result.details?.scope||'Unknown author-time viewport scope',scope:AUTHOR_SCOPE});
      } catch(error) {await report(item,'author-image',{event_id:`author/session.jsonl:line-${line}`,toolCallId:event.toolCallId,block_index:blockIndex,error:errorText(error)});}
    }
  }
  item.resources.push(await resource(directory,'evidence/recovery-author-observations.json','measured',AUTHOR_SCOPE,{observations,scope:AUTHOR_SCOPE}));
}
export async function claimAttestation(records,manifest,row,claimedPaths) {
  let supported=claimedPaths.length>0;
  for(const claimedPath of claimedPaths) {
    relativeFile(claimedPath);
    const frozen=manifest.arms[row.arm]?.snapshot?.files?.find(file=>file.path===claimedPath);
    if(!frozen){supported=false;continue;}
    const bytes=await regularBytes(await safePath(path.join(manifest.storage,'frozen',row.arm),claimedPath));
    ensure(sha(bytes)===frozen.sha256,'Frozen auxiliary source mismatch');
    const matches=records.filter(({record})=>record.type==='resource_read' && record.root==='skill' && record.path===claimedPath && record.sourceSha256===frozen.sha256 && record.sourceBytes===bytes.length);
    const verified=matches.some(({record:read,line})=>{
      const end=successfulTool(records,read.toolCallId),delivery=deliveredTool(records,read.toolCallId);
      const start=records.find(entry=>entry.record.event?.type==='tool_execution_start' && entry.record.event.toolCallId===read.toolCallId);
      if(!start || start.record.event.toolName!=='read_file' || start.record.event.args?.root!=='skill' || start.record.event.args?.path!==claimedPath || start.record.event.args?.startLine!==read.startLine)return false;
      // Resource prefetch may precede the SDK start event; later successful
      // completion and transcript delivery must follow both records.
      if(!end || !delivery || end.line<=Math.max(line,start.line) || delivery.line<=Math.max(line,start.line) || !Number.isInteger(read.startByte) || !Number.isInteger(read.endByte) || read.startByte<0 || read.endByte<=read.startByte || read.endByte>bytes.length)return false;
      const excerpt=bytes.subarray(read.startByte,read.endByte),hash=sha(excerpt);
      return hash===read.deliveredSha256 && excerpt.length===read.deliveredUtf8Bytes && end.record.event.toolName==='read_file' && [end.record.event.result?.content,delivery.record.event.message.content].every(content=>content?.some(block=>block.type==='text' && sha(block.text)===hash && Buffer.byteLength(block.text)===excerpt.length));
    });
    if(!verified)supported=false;
  }
  return {kind:'measured',status:supported?'supported':'unknown',scope:CLAIM_SCOPE};
}
async function captureImage(page,directory,filename,limits,item,scope) {
  const started=await page.evaluate(()=>performance.now());
  const dimensions=await page.evaluate(()=>({innerWidth,innerHeight,devicePixelRatio,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,media:matchMedia('print').matches?'print':'screen'}));
  ensure(dimensions.documentWidth*dimensions.documentHeight<=limits.evaluatorScreenshotPixels,'Full-page capture exceeds frozen pixel bound; no crop substituted');
  const bytes=await page.screenshot({fullPage:true,type:'png'});
  const location=`evidence/${filename}`;
  const retained=await resource(directory,location,'rendered',scope,bytes);
  if(bytes.byteLength>limits.evaluatorScreenshotBytes){item.retainedResources.push(retained);throw new Error('Retained full-page capture exceeds frozen release byte bound');}
  item.resources.push(retained);
  return {screenshot:filename,dimensions,bytes:retained.bytes,sha256:retained.sha256,browserStarted:started,browserFinished:await page.evaluate(()=>performance.now()),scope};
}
async function collectDialogNavigation(page,directory,item,context,ensureTextScale,limits) {
  const navigation={kind:'behavioral',scope:'Supplemental evaluator keyboard scrolling on unchanged final artifact; observations only, no additional acceptance gate or author-time claim.',events:[]};
  context.supplemental_navigation=navigation;
  ensure(context.stateScreenshots.length+2<=limits.evaluatorStateCapturesPerContext,'Supplemental captures exceed frozen per-context bound');
  const observe=()=>page.evaluate(()=>{
    const rectangle=element=>{if(!element)return null;const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    const dialog=document.querySelector('[data-settings-dialog]'),heading=dialog?.querySelector('h1,h2,h3');
    return {active:{tag:document.activeElement?.tagName,id:document.activeElement?.id,close:document.activeElement?.matches('[data-close-settings]')},
      window_scroll:{x:scrollX,y:scrollY},dialog:{rect:rectangle(dialog),scroll_top:dialog?.scrollTop,scroll_height:dialog?.scrollHeight,client_height:dialog?.clientHeight},
      heading:{text:heading?.textContent,rect:rectangle(heading)},select:{value:document.querySelector('[data-text-size]')?.value,rect:rectangle(document.querySelector('[data-text-size]'))}};
  });
  await page.focus('[data-open-settings]');
  await page.keyboard.press('Enter');
  await ensureTextScale();
  navigation.events.push({action:'Focus supplied opener, then actual Enter',after:await observe()});
  for(let attempt=0;attempt<8 && !await page.$eval('[data-close-settings]',element=>element===document.activeElement);attempt++) {
    await page.keyboard.press('Tab');navigation.events.push({action:'Tab',after:await observe()});
  }
  ensure(await page.$eval('[data-close-settings]',element=>element===document.activeElement),'Supplemental keyboard traversal did not reach Close; no forced focus substituted');
  for(const [key,label] of [['PageUp','keyboard-pageup'],['PageDown','keyboard-pagedown']]) {
    const before=await observe();
    await page.keyboard.press(key);
    const settling=await page.evaluate(async()=>{
      const position=()=>{const dialog=document.querySelector('[data-settings-dialog]');return [scrollX,scrollY,dialog?.scrollTop,dialog?.scrollLeft];};
      let previous=JSON.stringify(position()),stable=0,frames=0;
      const started=performance.now();
      while(stable<3 && performance.now()-started<2000) {
        await new Promise(resolve=>requestAnimationFrame(resolve));frames++;
        const current=JSON.stringify(position());stable=current===previous?stable+1:0;previous=current;
      }
      return {settled:stable>=3,frames,elapsed_ms:performance.now()-started,scope:'Observed scroll stability; no scroll position is written.'};
    });
    const scale=await ensureTextScale(),after=await observe();
    const frame=await captureImage(page,directory,`text200-state-${label}.png`,limits,item,'Actual keyboard scroll observation at verified 200% text; full page, not a simultaneous-visibility or physical-user claim.');
    navigation.events.push({action:key,before,after,scale,settling,screenshot:frame.screenshot});
  }
  await page.keyboard.press('Escape');navigation.events.push({action:'Escape',after:await observe()});
}
async function collectStableEvaluation(manifest,scenario,trial,directory,item,browserModule,evaluator,report) {
  const evaluation={contexts:[],observations:[],scope:'Current stable-scaling evaluator observations on unchanged original final artifact; historical observations remain immutable.'};
  let browser;
  try {
    browser=await browserModule.startBrowser({workspace:trial.artifact,scratch:path.join(directory,'owned-browser'),executablePath:manifest.runtime.chrome,bwrapPath:manifest.runtime.bwrap,codingAgentPackage:path.join(manifest.runtime.modules,'@oh-my-pi/pi-coding-agent/package.json'),navigateOnStart:false});
    await evaluator.preparePage(browser.page,scenario);
    const cdp=await browser.page.createCDPSession();
    for(const [context_id,width,height,text_scale] of [['wide',1440,1000,1],['narrow',320,900,1],['text200',320,900,2]]) {
      const context={context_id,viewport:{width,height},text_scale,stateScreenshots:[],scaleRecords:[],failures:[]};evaluation.contexts.push(context);
      const ensureTextScale=async()=>{
        try {const record=await browserModule.ensureTextScale(browser.page,2);context.scaleRecords.push(record);ensure(record.verified===true && record.observation?.verified===true,'Current text scale is not verified');return record;}
        catch(error){context.scaleRecords.push({error:errorText(error),verified:false});throw error;}
      };
      const observeTextScale=async()=>{const record=await browserModule.observeTextScale(browser.page);context.scaleRecords.push({kind:'observation',verified:record.verified,observation:record});return record;};
      const captureState=async label=>{
        ensure(scenario.review_states.includes(label) && /^[a-z0-9-]{1,48}$/.test(label),'Undeclared state capture');
        ensure(!context.stateScreenshots.some(frame=>frame.label===label) && context.stateScreenshots.length<manifest.limits.evaluatorStateCapturesPerContext,'Duplicate/excess state capture');
        try {
          if(text_scale===2)await ensureTextScale();
          const frame=await captureImage(browser.page,directory,`${context_id}-state-${label}.png`,manifest.limits,item,'Current final artifact, evaluator-established named state; full page, contained scrollers are not independently traversed.');
          const verifiedScale=text_scale===2?await observeTextScale():null;
          const record={label,context_id,text_scale,...frame,verifiedScale};context.stateScreenshots.push(record);
          ensure(!verifiedScale || verifiedScale.verified===true,'State capture scale not verified');return record;
        } catch(error) {context.failures.push({stage:'state-capture',label,error:errorText(error)});await report(item,'state-capture',{context_id,label,error:errorText(error)});throw error;}
      };
      try {
        await browser.page.setViewport({width,height,deviceScaleFactor:1});
        await cdp.send('Storage.clearDataForOrigin',{origin:browser.origin,storageTypes:'all'});
        await browser.page.goto(browser.origin,{waitUntil:'networkidle0',timeout:30000});
        await browser.page.evaluate(()=>document.fonts.ready.then(()=>true));
        if(text_scale===2)context.scaling=await ensureTextScale();
        context.result=await bounded(evaluator.evaluate(browser.page,scenario,{context_id,text_scale,ensureTextScale:text_scale===2?ensureTextScale:undefined,observeTextScale:text_scale===2?observeTextScale:undefined,captureState,text_scaling_evidence:text_scale===2?{method:'computed-font-snapshot-css-px',evidence_path:'text200-text-scale.json'}:null,trace:{reference:'trace',complete:false},artifacts:{unchanged_inventory_reference:'artifact_inventory',unchanged:null},handoff:{reference:'handoff',text:''}}),manifest.limits.evaluatorSecondsPerContext*1000,`${context_id} recovery evaluation`,()=>browser.close());
        if(text_scale===2)await ensureTextScale();
        Object.assign(context,await captureImage(browser.page,directory,`${context_id}.png`,manifest.limits,item,'Current unchanged final artifact after evaluator interactions; full page, not independent user testing.'));
        if(text_scale===2){context.finalScaling=await observeTextScale();ensure(context.finalScaling.verified===true,'Final scale not verified');}
        if(scenario.id==='V3-04' && text_scale===2) {
          try {await collectDialogNavigation(browser.page,directory,item,context,ensureTextScale,manifest.limits);}
          catch(error){context.supplemental_navigation_error=errorText(error);await report(item,'supplemental-navigation',{context_id,error:errorText(error)});}
        }
      } catch(error) {context.error=errorText(error);await report(item,'stable-context',{context_id,error:context.error});}
      finally {
        if(text_scale===2) {
          item.resources.push(await resource(directory,'evidence/text200-text-scale.json','measured','Raw stable text scaling observations, including all unsuccessful records.',{snapshots:context.scaleRecords,final:context.finalScaling||null,error:context.error||null}));
          try {await browserModule.resetTextScale(browser.page);} catch(error) {await report(item,'scale-reset',{context_id,error:errorText(error)});}
        }
      }
      for(const label of scenario.review_states)if(!context.stateScreenshots.some(frame=>frame.label===label))await report(item,'missing-state',{context_id,label,error:'No successful named-state capture; evaluator result and unsuccessful observations retained.'});
    }
  } catch(error) {evaluation.error=errorText(error);await report(item,'stable-evaluation',{error:evaluation.error});}
  finally {
    if(browser) {
      try {evaluation.observations.push(await browser.evidence());} catch(error) {await report(item,'browser-evidence',{error:errorText(error)});}
      try {await browser.close();} catch(error) {await report(item,'owned-browser-cleanup',{error:errorText(error)});}
    }
    const record=await resource(directory,'evidence/evaluation.json','behavioral',evaluation.scope,evaluation);item.resources.push(record);
    item.replacements={evaluation:record.location,evidence_files:item.resources.filter(entry=>/^evidence\/(?:evaluation\.json|(?:wide|narrow|text200)(?:-state-[a-z0-9-]+)?\.png|text200-text-scale\.json)$/.test(entry.location)).map(entry=>entry.location),scope:'Replace only current evaluator evidence in the separately versioned packet; never overwrite original evidence or votes.'};
  }
}
function chromiumPageCount(bytes) {
  // Chrome emits an uncompressed flat page tree. Fail closed on another PDF shape;
  // this structural check is not a general PDF parser or rasterization attestation.
  const text=Buffer.from(bytes).toString('latin1'),trees=[...text.matchAll(/\b\d+\s+\d+\s+obj\s*<<(?:(?!endobj)[\s\S])*?\/Type\s*\/Pages\b(?:(?!endobj)[\s\S])*?endobj/g)];
  const leaves=[...text.matchAll(/\/Type\s*\/Page\b/g)].length;
  ensure(trees.length===1,'Unsupported PDF page tree; complete native output retained for parent parser');
  const count=trees[0][0].match(/\/Count\s+(\d+)\b/);
  ensure(count && Number(count[1])===leaves && leaves>0,'PDF page-count consistency unavailable');return leaves;
}
async function collectPrintPDF(manifest,trial,directory,item,browserModule,report) {
  let browser;const metadata={options:{preferCSSPageSize:true,printBackground:true,waitForFonts:true,pageRanges:'',timeout:PDF_LIMITS.timeout},limits:PDF_LIMITS,page_size_policy:'Honor CSS @page size. When absent, leave width/height/format unset and retain pinned document-driver default (Letter). No single tall-page substitution.',scope:'Native paginated Chrome print rendering of unchanged final artifact; parent must rasterize every page before visual review.',accepted:false};
  try {
    browser=await browserModule.startBrowser({workspace:trial.artifact,scratch:path.join(directory,'owned-print-browser'),executablePath:manifest.runtime.chrome,bwrapPath:manifest.runtime.bwrap,codingAgentPackage:path.join(manifest.runtime.modules,'@oh-my-pi/pi-coding-agent/package.json'),navigateOnStart:false});
    await browser.page.goto(browser.origin,{waitUntil:'networkidle0',timeout:30000});
    await browser.page.emulateMediaType('print');await browser.page.bringToFront();
    metadata.fonts=await browser.page.evaluate(async()=>{await document.fonts.ready;return {status:document.fonts.status,faces:[...document.fonts].map(face=>({family:face.family,status:face.status,style:face.style,weight:face.weight}))};});
    metadata.document=await browser.page.evaluate(()=>({width:innerWidth,height:innerHeight,print:matchMedia('print').matches,page_rules:[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(rule=>rule.type===CSSRule.PAGE_RULE).map(rule=>rule.cssText);}catch{return ['Stylesheet rules inaccessible'];}})}));
    const bytes=await browser.page.pdf(metadata.options);
    const pdf=await resource(directory,'evidence/print-native.pdf','rendered',metadata.scope,bytes);metadata.pdf=pdf.location;item.pdfPaths.push(pdf.path);
    try {
      ensure(bytes.byteLength<=PDF_LIMITS.bytes,'Native PDF exceeds release byte bound; full output retained, never truncated');
      metadata.pages=chromiumPageCount(bytes);metadata.page_count_method='Conservative flat Chromium page-tree/leaf consistency check; parent parser/rasterizer must confirm.';
      ensure(metadata.pages<=PDF_LIMITS.pages,'Native PDF exceeds release page bound; all pages retained, no range substituted');metadata.accepted=true;
      item.resources.push(pdf);
    } catch(error) {item.retainedResources.push(pdf);throw error;}
  } catch(error) {metadata.error=errorText(error);await report(item,'print-pdf',{error:metadata.error});}
  finally {
    if(browser){try{metadata.browser=await browser.evidence();}catch(error){await report(item,'print-browser-evidence',{error:errorText(error)});}try{await browser.close();}catch(error){await report(item,'owned-print-cleanup',{error:errorText(error)});}}
    item.resources.push(await resource(directory,'evidence/recovery-print.json','measured',metadata.scope,metadata));item.print={metadata:'evidence/recovery-print.json',accepted:metadata.accepted,pages:metadata.pages??null};
  }
}

/** Collect supplementary observations only; no author trials, scoring, CLI, or providers.
 * The returned receipt is custodian-only. Per-artifact resources are the release allowlist;
 * auxiliary-read attestations intentionally contain no supplied path/content/treatment data.
 * A fresh absolute external output directory is required; interrupted output is never reused.
 */
export async function collectRecoveryEvidence({manifestPath,expectedManifestHash,out,claimChecks=[]}) {
  ensure(typeof out==='string' && path.isAbsolute(out),'New absolute external output directory required');
  const resolvedOut=path.resolve(out),parent=await realpath(path.dirname(resolvedOut));
  ensure(path.join(parent,path.basename(resolvedOut))===resolvedOut,'Output parent must be canonical, without symlink aliases');
  ensure(!contained(REPO,resolvedOut) && !await exists(resolvedOut),'Output must be new and outside repository');
  const {manifest,manifestPath:originalManifest}=await validateManifest(manifestPath,expectedManifestHash);
  ensure(!contained(manifest.storage,resolvedOut) && !contained(resolvedOut,manifest.storage),'Output and immutable cohort must be disjoint');
  ensure(Array.isArray(claimChecks),'claimChecks must be an array');
  const claims=new Map();
  for(const check of claimChecks) {
    ensure(check && manifest.order.some(row=>row.artifactId===check.artifactId) && !claims.has(check.artifactId) && Array.isArray(check.claimedPaths) && check.claimedPaths.every(value=>typeof value==='string'),'Invalid explicit claim check');
    check.claimedPaths.forEach(relativeFile);claims.set(check.artifactId,check.claimedPaths);
  }
  await mkdir(resolvedOut,{mode:0o700});
  const receipt={schema_version:'peccable-v3-recovery-evidence-v1',started_at:new Date().toISOString(),manifest:{path:originalManifest,sha256:expectedManifestHash},out:resolvedOut,sourceBindings:{},artifacts:[],failures:[],limits:{pdf:PDF_LIMITS},scope:'Separately versioned supplementary evidence; not author reruns, independent scoring, historical evidence replacement, or adoption proof.'};
  const journal=path.join(resolvedOut,'journal.jsonl');await put(journal,'');
  const report=async(item,stage,details)=>{const failure={artifactId:item?.artifactId||null,stage,...details,at:new Date().toISOString()};receipt.failures.push(failure);if(item)item.failures.push(failure);await appendFile(journal,`${JSON.stringify(failure)}\n`);};
  try {
    receipt.sourceBindings=await snapshotSources(resolvedOut,manifest);
    await put(path.join(resolvedOut,'source-bindings.json'),receipt.sourceBindings);
    const suite=JSON.parse(await regularBytes(await safePath(manifest.storage,'frozen/holdouts.json')));
    ensure(suite.scenarios?.length===7 && suite.scenarios[3].id==='V3-04' && suite.scenarios[5].id==='V3-06' && suite.scenarios[6].id==='V3-07','Unexpected original V3 scenario layout');
    for(const index of [3,5,6])ensure(manifest.order.filter(row=>row.briefIndex===index).length===9,'Affected brief must contain all nine frozen artifacts');
    // All maintenance and evaluator source bytes are snapshotted before any import.
    const browserModule=await import(pathToFileURL(receipt.sourceBindings.browser.path).href);
    const evaluator=await import(pathToFileURL(receipt.sourceBindings.evaluator.path).href);
    ensure(typeof browserModule.ensureTextScale==='function' && typeof browserModule.observeTextScale==='function' && typeof browserModule.resetTextScale==='function' && typeof evaluator.evaluate==='function' && typeof evaluator.preparePage==='function','Required recovery browser/evaluator exports unavailable');
    for(const row of manifest.order) {
      const item={artifactId:row.artifactId,resources:[],retainedResources:[],pdfPaths:[],replacements:null,sourceBindings:{},failures:[]};receipt.artifacts.push(item);
      const directory=path.join(resolvedOut,'artifacts',row.artifactId);await mkdir(directory,{recursive:true,mode:0o700});let trial;
      try {
        trial=await loadTrial(manifest,expectedManifestHash,row);
        item.sourceBindings={attempt:trial.attempt,artifact:trial.artifact,before:trial.before,originalOutcome:path.join(trial.base,'outcome.json'),originalEvidence:path.join(trial.base,'evidence'),manifestSha256:expectedManifestHash};
        let records=[];
        try {
          const tracePath=await safePath(trial.base,'evidence/author/session.jsonl');
          item.sourceBindings.authorTrace={path:tracePath,...await fileDigest(tracePath)};
          records=await readTrace(tracePath,details=>report(item,'trace-parse',details));await collectAuthorImages(records,directory,item,report);
        } catch(error){await report(item,'author-observations',{error:errorText(error)});}
        if(claims.has(row.artifactId)) {
          let attestation={status:'unknown',scope:CLAIM_SCOPE};
          try {attestation=await claimAttestation(records,manifest,row,claims.get(row.artifactId));}catch{await report(item,'auxiliary-attestation',{error:'Explicit auxiliary-read claim could not be verified. No claim paths or treatment information are released.'});}
          item.resources.push(await resource(directory,'evidence/recovery-auxiliary-read.json','measured',CLAIM_SCOPE,attestation));
        }
        if([3,6].includes(row.briefIndex))await collectStableEvaluation(manifest,suite.scenarios[row.briefIndex],trial,directory,item,browserModule,evaluator,report);
        if(row.briefIndex===5)await collectPrintPDF(manifest,trial,directory,item,browserModule,report);
      } catch(error) {await report(item,'artifact-collection',{error:errorText(error)});}
      finally {
        if(trial) {
          try {item.sourceBindings.after=await inventory(trial.artifact);item.sourceBindings.preserved=same(trial.before,item.sourceBindings.after);ensure(item.sourceBindings.preserved,'Original artifact bytes changed during collection');}
          catch(error){await report(item,'artifact-preservation',{error:errorText(error)});}
        }
        await put(path.join(directory,'receipt.json'),item);
        await appendFile(journal,`${JSON.stringify({at:new Date().toISOString(),artifactId:row.artifactId,stage:'artifact-complete',resources:item.resources.length,failures:item.failures.length})}\n`);
      }
    }
  } catch(error) {await report(null,'collector',{error:errorText(error)});}
  finally {
    try {ensure((await fileDigest(originalManifest)).sha256===expectedManifestHash && same(await inventory(path.join(manifest.storage,'frozen')),manifest.frozen),'Original manifest/frozen bytes changed during collection');receipt.original_sources_preserved=true;}
    catch(error){receipt.original_sources_preserved=false;await report(null,'original-preservation',{error:errorText(error)});}
    receipt.finished_at=new Date().toISOString();receipt.complete=receipt.artifacts.length===63 && receipt.failures.length===0 && receipt.original_sources_preserved===true;
    receipt.receiptPath=path.join(resolvedOut,'receipt.json');await put(receipt.receiptPath,receipt);
  }
  return receipt;
}
