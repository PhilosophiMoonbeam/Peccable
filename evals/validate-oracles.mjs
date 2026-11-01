#!/usr/bin/env bun
// Repository maintenance only: validate frozen oracle controls before author trials.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const HELP='bun evals/validate-oracles.mjs --out ABS_NEW_DIRECTORY --modules ABS_INSTALLED_NODE_MODULES --chrome ABS_CHROME [--holdouts PATH] [--evaluator PATH] [--harness PATH]';
const sha=value=>createHash('sha256').update(value).digest('hex');
const json=value=>`${JSON.stringify(value,null,2)}\n`;
function ensure(ok,message){if(!ok)throw new Error(message);}
function parse(argv){const out={};while(argv.length){const key=argv.shift();ensure(['--out','--modules','--chrome','--holdouts','--evaluator','--harness'].includes(key)&&!Object.hasOwn(out,key.slice(2)),HELP);const value=argv.shift();ensure(value&&!value.startsWith('--'),HELP);out[key.slice(2)]=value;}return out;}
async function put(filename,value){await fs.mkdir(path.dirname(filename),{recursive:true});await fs.writeFile(filename,typeof value==='string'?value:json(value),{flag:'wx',mode:0o600});}
function relative(name){ensure(typeof name==='string'&&name&&!path.isAbsolute(name)&&!name.includes('\0')&&!name.split(/[\\/]/).some(part=>!part||part==='..'||part==='.'),'Unsafe fixture file path');return name;}

function consumerControls(merge) {
  const spec = { id: 'contract', category: 'data', method: 'review', requirement: 'Retain supplied facts.' };
  const trace = { complete: true, events: [] };
  const files = [{ path: 'index.html', bytes: 7, sha256: sha('fixture') }];
  const inventory = { files, sha256: sha(json(files)) };
  const resources = { brief: 'A scoped task', input_fixture: { count: 7 }, 'starter_files/index.html': 'fixture', artifact_inventory: inventory,
    'evidence/artifact-freeze.json': { before: inventory, after: inventory, unchanged: true }, trace };
  const bundle = { specs: [spec], evaluation: { contexts: [] }, resources, trace, neutral: { permission_mode: { source_writes: [] } } };
  const vote = (location, kind = 'source', result = 'pass') => ({ assertions: [{ id: spec.id, result, reason: 'Explicit consumer boundary control, not a model judgment', evidence_location: location, evidence_records: [{ location, kind, observation: 'Synthetic contract input' }] }] });
  const checks = [];
  const check = (name, want, item, votes, adjudication) => checks.push({ name, want, got: merge(item, votes, adjudication)[0].result });
  for (const location of ['brief', 'input_fixture', 'starter_files/index.html']) check(`source-${location}`, 'pass', { bundle }, [vote(location), vote(location)]);
  check('source-is-not-measured', 'unverified', { bundle }, [vote('input_fixture', 'measured'), vote('input_fixture', 'measured')]);
  check('measured-inventory', 'pass', { bundle }, [vote('evidence/artifact-freeze.json', 'measured'), vote('evidence/artifact-freeze.json', 'measured')]);
  const badInventory = structuredClone(bundle);
  badInventory.resources['evidence/artifact-freeze.json'].after.sha256 = '0'.repeat(64);
  check('tampered-inventory', 'unverified', { bundle: badInventory }, [vote('evidence/artifact-freeze.json', 'measured'), vote('evidence/artifact-freeze.json', 'measured')]);
  const read = structuredClone(bundle);
  read.trace.events = [
    { type: 'tool_execution_start', toolName: 'browser', toolCallId: 'read', args: { action: 'read' } },
    { type: 'tool_execution_end', toolName: 'browser', toolCallId: 'read', isError: false, result: { details: { url: 'http://127.0.0.1/', text: 'Observed state', nodes: [] } } },
  ];
  read.resources.trace = read.trace;
  check('completed-readback', 'pass', { bundle: read }, [vote('trace#/events/0', 'behavioral'), vote('trace#/events/1', 'behavioral')]);
  const attempted = structuredClone(read); attempted.trace.events.pop(); attempted.resources.trace = attempted.trace;
  check('attempt-is-not-readback', 'unverified', { bundle: attempted }, [vote('trace#/events/0', 'behavioral'), vote('trace#/events/0', 'behavioral')]);
  const failed = structuredClone(read); failed.trace.events[1].isError = true; failed.resources.trace = failed.trace;
  check('failed-read-is-not-observation', 'unverified', { bundle: failed }, [vote('trace#/events/0', 'behavioral'), vote('trace#/events/0', 'behavioral')]);
  const incomplete = structuredClone(bundle); incomplete.trace.complete = false; incomplete.specs[0].category = 'authority';
  check('incomplete-authority-trace', 'unverified', { bundle: incomplete }, [vote('input_fixture'), vote('input_fixture')]);
  const disputed = [vote('input_fixture', 'source', 'fail'), vote('input_fixture')];
  const adjudication = { assertions: [{ id: spec.id, result: 'unverified', evidence_records: [] }] };
  check('unknown-adjudication-is-not-manual-failure', 'unverified', { bundle }, disputed, adjudication);
  const runtime = structuredClone(bundle);
  runtime.specs[0].method = 'runtime';
  runtime.neutral.permission_mode.source_writes = ['index.html'];
  runtime.evaluation.contexts = ['wide', 'narrow', 'text200'].map(context_id => ({ context_id, result: { assertions: [{ id: spec.id, result: 'fail', actual: false, evidence: { kind: 'behavioral' } }] } }));
  check('runtime-failure-survives-unknown-adjudication', 'fail', { bundle: runtime }, disputed, adjudication);
  for (const context of runtime.evaluation.contexts) context.result.assertions[0].result = 'pass';
  check('audited-runtime-survives-packet-rejection', 'pass', { bundle: null, specs: runtime.specs, runtimeBundle: { evaluation: runtime.evaluation, expectedContexts: ['wide', 'narrow', 'text200'] }, outcome: { assertions: [] } }, [null, null]);
  check('summary-is-not-runtime-proof', 'unverified', { bundle: null, specs: runtime.specs, outcome: { assertions: [{ id: spec.id, result: 'pass' }] } }, [null, null]);
  runtime.evaluation.contexts = [];
  check('source-votes-do-not-substitute-runtime', 'unverified', { bundle: runtime }, [vote('input_fixture'), vote('input_fixture')]);
  const auxiliary=structuredClone(bundle),auxiliaryLocation='evidence/recovery-auxiliary-read.json';
  auxiliary.specs[0].category='authority';auxiliary.resources[auxiliaryLocation]={status:'supported',scope:'Recorded excerpt delivery only'};
  auxiliary.supplementalMeasuredLocations=new Set([auxiliaryLocation]);
  check('supported-excerpt-is-authority-evidence','pass',{bundle:auxiliary},[vote(auxiliaryLocation,'measured'),vote(auxiliaryLocation,'measured')]);
  check('supported-excerpt-status-pointer','pass',{bundle:auxiliary},[vote(`${auxiliaryLocation}#/status`,'measured'),vote(`${auxiliaryLocation}#/status`,'measured')]);
  const unknownAuxiliary=structuredClone(auxiliary);unknownAuxiliary.resources[auxiliaryLocation].status='unknown';
  check('unknown-excerpt-is-not-affirmative-proof','unverified',{bundle:unknownAuxiliary},[vote(auxiliaryLocation,'measured'),vote(auxiliaryLocation,'measured')]);
  const factsFromRead=structuredClone(auxiliary);factsFromRead.specs[0].category='data';
  check('reading-attestation-does-not-prove-task-facts','unverified',{bundle:factsFromRead},[vote(auxiliaryLocation,'measured'),vote(auxiliaryLocation,'measured')]);
  const authorLocation='evidence/recovery-author-observations.json',author=structuredClone(auxiliary);
  author.resources[authorLocation]={observations:[],scope:'No captured image'};author.supplementalMeasuredLocations.add(authorLocation);
  check('empty-author-observations-are-not-proof','unverified',{bundle:author},[vote(authorLocation,'measured'),vote(authorLocation,'measured')]);
  author.resources[authorLocation].observations=[{location:'evidence/recovery-author-1.png',toolCallId:'observed-tool',delivered_to_transcript:true,provider_inclusion:{status:'included',evidence:[{match:'Exact matching outbound image'}]}}];
  author.resources['evidence/recovery-author-1.png']={image:true};
  check('delivered-author-image-supports-past-observation','pass',{bundle:author},[vote(authorLocation,'measured'),vote(authorLocation,'measured')]);
  check('included-author-image-status-pointer','pass',{bundle:author},[vote(`${authorLocation}#/observations/0/provider_inclusion/status`,'measured'),vote(`${authorLocation}#/observations/0/provider_inclusion/status`,'measured')]);
  check('scope-string-is-not-an-observation','unverified',{bundle:author},[vote(`${authorLocation}#/scope`,'measured'),vote(`${authorLocation}#/scope`,'measured')]);
  const imageWithoutInclusion=structuredClone(author);imageWithoutInclusion.resources[authorLocation].observations[0].provider_inclusion.status='unknown';
  check('unknown-image-inclusion-is-not-past-verification','unverified',{bundle:imageWithoutInclusion},[vote(authorLocation,'measured'),vote(authorLocation,'measured')]);
  const print=structuredClone(bundle),printLocation='evidence/recovery-print.json';
  print.resources[printLocation]={accepted:false,scope:'Native PDF failed'};print.supplementalMeasuredLocations=new Set([printLocation]);
  check('failed-print-capture-is-not-proof','unverified',{bundle:print},[vote(printLocation,'measured'),vote(printLocation,'measured')]);
  return checks;
}

/** Context coverage is checked by identity and per-context rows, not totals. */
export function runtimeCoverageControls(runtimeRecord, mergedAssertions) {
  const spec={id:'coverage',category:'task',method:'runtime',requirement:'Observe each declared context.'};
  const context=context_id=>({context_id,result:{assertions:[{id:spec.id,result:'pass',actual:{observed:true},evidence:{kind:'measured'}}]}});
  const bundle={specs:[spec],evaluation:{contexts:['wide','narrow','text200'].map(context)},neutral:{permission_mode:{source_writes:['index.html']}},resources:{},trace:{complete:true,events:[]}};
  const checks=[];
  const check=(name,want,value,scope)=>checks.push({name,want,got:runtimeRecord(spec,value,scope).result});
  const mutation=(name,change,want='unverified')=>{
    const value=structuredClone(bundle);change(value.evaluation.contexts);
    check(name,want,value);
    checks.push({name:`${name}-merged`,want,got:mergedAssertions({bundle:value},[null,null])[0].result});
    const failed=structuredClone(value);
    failed.evaluation.contexts[0].result.assertions.push({id:spec.id,result:'fail',actual:{observed:false},evidence:{kind:'behavioral'}});
    const unknown={assertions:[{id:spec.id,result:'unverified',evidence_records:[]}]};
    const manual={assertions:[{id:spec.id,result:'pass',evidence_location:'',evidence_records:[]}]};
    checks.push({name:`${name}-native-failure-precedence`,want:'fail',got:mergedAssertions({bundle:failed},[unknown,manual],unknown)[0].result});
  };
  check('complete-three-context-measurements','pass',bundle);
  check('context-order-is-not-significant','pass',{...bundle,evaluation:{contexts:[...bundle.evaluation.contexts].reverse()}});
  for(const id of ['wide','narrow','text200']) {
    const single={...bundle,evaluation:{contexts:[context(id)]}};
    check(`whole-task-missing-other-contexts-${id}`,'unverified',single);
    check(`explicit-native-preflight-${id}`,'pass',single,[id]);
    mutation(`missing-whole-context-${id}`,contexts=>contexts.splice(contexts.findIndex(row=>row.context_id===id),1));
  }
  mutation('duplicate-row-compensates-missing-row',contexts=>{contexts[0].result.assertions.push(structuredClone(contexts[0].result.assertions[0]));contexts[1].result.assertions=[];});
  mutation('duplicate-assertion-row',contexts=>contexts[0].result.assertions.push(structuredClone(contexts[0].result.assertions[0])));
  mutation('duplicate-context-identity',contexts=>contexts[1].context_id=contexts[0].context_id);
  mutation('extra-context',contexts=>contexts.push(context('wide')));
  mutation('unknown-context-identity',contexts=>contexts[1].context_id='unknown');
  mutation('empty-context-identity',contexts=>contexts[1].context_id='');
  mutation('absent-context-identity',contexts=>delete contexts[1].context_id);
  mutation('empty-assertion-identity',contexts=>contexts[0].result.assertions.push({id:'',result:'pass'}));
  mutation('duplicate-other-assertion-identities',contexts=>contexts[0].result.assertions.push({id:'other',result:'pass'},{id:'other',result:'pass'}));
  mutation('context-error',contexts=>contexts[1].error='Capture incomplete');
  mutation('assertion-context-error',contexts=>contexts[1].result.assertions[0].context_error='Measurement incomplete');
  mutation('missing-actual',contexts=>delete contexts[1].result.assertions[0].actual);
  mutation('source-is-not-native-evidence',contexts=>contexts[1].result.assertions[0].evidence.kind='source');
  mutation('unknown-observation',contexts=>contexts[1].result.assertions[0].result='unverified');
  mutation('mixed-not-applicable-and-real-observation',contexts=>contexts[1].result.assertions[0].result='not_applicable','pass');
  mutation('all-not-applicable',contexts=>contexts.forEach(row=>row.result.assertions[0].result='not_applicable'),'not_applicable');
  mutation('not-applicable-does-not-hide-context-error',contexts=>{contexts[1].result.assertions[0].result='not_applicable';contexts[1].error='Capture incomplete';});
  for(const scope of [[],['wide','wide'],['unknown'],['planning','wide']])check(`invalid-explicit-scope-${JSON.stringify(scope)}`,'unverified',bundle,scope);
  check('explicit-planning-measurement','pass',{...bundle,evaluation:{contexts:[context('planning')]}},['planning']);
  check('planning-is-not-whole-runtime-task','unverified',{...bundle,evaluation:{contexts:[context('planning')]}});
  // Match loadTrial's retained producer exactly: evaluation plus audited scope,
  // without a neutral packet whose permissions could conceal a lost scope.
  const planningSpec={id:'planning-inventory',category:'authority',method:'planning',requirement:'Retain the unchanged source inventory.'};
  const designSpec={id:'planning-design',category:'design',method:'review',requirement:'Rendered design is not applicable to the source-only plan.'};
  const inventory={...planningSpec,result:'pass',actual:{unchanged:true,inventory_reference:'artifact-freeze.json'},evidence:{kind:'measured'}};
  const design={...designSpec,result:'not_applicable',actual:{source_only:true},evidence:{kind:'source'}};
  const planning={evaluation:{contexts:[{context_id:'planning',result:{assertions:[inventory,design]}}]},expectedContexts:['planning']};
  const retained=(value,outcome={assertions:[inventory,design]})=>({bundle:null,specs:[planningSpec,designSpec],runtimeBundle:value,outcome});
  const planningCheck=(name,want,value,index=0,outcome)=>{
    checks.push({name,want,got:mergedAssertions(retained(value,outcome),[null,null])[index].result});
  };
  planningCheck('retained-planning-inventory','pass',planning);
  planningCheck('retained-planning-source-design-not-applicable','not_applicable',planning,1);
  const admitted={specs:[planningSpec,designSpec],evaluation:planning.evaluation,neutral:{permission_mode:{source_writes:[]}},resources:{},trace:{complete:true,events:[]}};
  checks.push({name:'retained-planning-matches-admitted-evidence',want:true,got:JSON.stringify(mergedAssertions(retained(planning),[null,null]).map(row=>row.result))===JSON.stringify(mergedAssertions({bundle:admitted},[null,null]).map(row=>row.result))});
  for(const scope of [undefined,null,[],['planning','planning'],['unknown'],['planning','wide'],['wide','narrow','text200'],'planning']) {
    const value={evaluation:planning.evaluation,...(scope===undefined?{}:{expectedContexts:scope})};
    for(const index of [0,1])planningCheck(`retained-planning-invalid-scope-${JSON.stringify(scope)??'missing'}-${index}`,'unverified',value,index);
    const failed=structuredClone(value);
    failed.evaluation.contexts[0].result.assertions[0].result='fail';
    planningCheck(`retained-planning-native-failure-before-invalid-scope-${JSON.stringify(scope)??'missing'}`,'fail',failed);
  }
  for(const [name,change] of [
    ['unknown',value=>{value.evaluation.contexts[0].result.assertions[0].result='unverified';}],
    ['missing-actual',value=>{delete value.evaluation.contexts[0].result.assertions[0].actual;}],
    ['source-is-not-native-inventory',value=>{value.evaluation.contexts[0].result.assertions[0].evidence.kind='source';}],
    ['context-error',value=>{value.evaluation.contexts[0].error='Inventory capture incomplete';}],
    ['duplicate-context',value=>{value.evaluation.contexts.push(structuredClone(value.evaluation.contexts[0]));}],
  ]) {
    const value=structuredClone(planning);change(value);
    planningCheck(`retained-planning-${name}`,'unverified',value);
  }
  const unknownDesign=structuredClone(planning);
  unknownDesign.evaluation.contexts[0].result.assertions[1].result='unverified';
  planningCheck('retained-planning-design-unknown-is-not-not-applicable','unverified',unknownDesign,1);
  const failedDesign=structuredClone(unknownDesign);
  failedDesign.evaluation.contexts[0].result.assertions[1].result='fail';
  planningCheck('retained-planning-design-native-failure','fail',failedDesign,1);
  planningCheck('retained-planning-original-failure-precedence','fail',planning,0,{assertions:[{...inventory,result:'fail'},design]});
  const retainedEditing={evaluation:bundle.evaluation,expectedContexts:['wide','narrow','text200']};
  const editingResult=value=>mergedAssertions({bundle:null,specs:[spec],runtimeBundle:value,outcome:{assertions:[]}},[null,null])[0].result;
  checks.push({name:'retained-edit-and-author-no-runtime-evaluator-coverage',want:'pass',got:editingResult(retainedEditing)});
  checks.push({name:'retained-edit-missing-scope-is-not-default-coverage',want:'unverified',got:editingResult({evaluation:bundle.evaluation})});
  checks.push({name:'retained-edit-missing-whole-context',want:'unverified',got:editingResult({...retainedEditing,evaluation:{contexts:bundle.evaluation.contexts.slice(0,2)}})});
  return checks;
}

/** Exercise the public recorder without resolving an SDK or provider. */
export async function traceCeilingControls(runTask, outputDir, agentBinding, checks=[]) {
  const ceiling=65536,allowance=ceiling-Math.floor(ceiling/4),cases=[];
  const check=(name,got,want)=>checks.push({name,want,got});
  const emptyStartupBytes=Buffer.byteLength(JSON.stringify({type:'run_start',at:'2000-01-01T00:00:00.000Z',sessionId:'0'.repeat(36),taskId:''})+'\n');
  const edgeTaskId='x'.repeat(allowance-emptyStartupBytes);
  const plans=[
    {id:'oversized-start',taskId:'x'.repeat(70*1024),limited:true},
    {id:'oversized-start-utf8',taskId:'界'.repeat(24*1024),limited:true},
    {id:'oversized-terminal',taskId:'compact',model:{padding:'x'.repeat(128*1024)},compact:true},
    {id:'oversized-start-and-terminal',taskId:'x'.repeat(70*1024),model:{padding:'x'.repeat(128*1024)},limited:true,compact:true},
    {id:'small-pre-provider-failure',taskId:'small'},
    {id:'ordinary-allowance-exact',taskId:edgeTaskId,startupBytes:allowance},
    {id:'ordinary-allowance-plus-one',taskId:edgeTaskId+'x',limited:true,startupBytes:allowance+1},
  ];
  for(const plan of plans) {
    const logPath=path.join(outputDir,`${plan.id}.jsonl`);
    let runtimeEntries=0,credentialCalls=0;
    const contract={logPath,taskId:plan.taskId,maxSeconds:1,maxTurns:1,maxToolCalls:1,maxTraceBytes:ceiling,
      mode:'invalid-offline-probe',allowedWritePaths:[],model:plan.model,
      getApiKey:()=>{credentialCalls++;throw new Error('Provider entry forbidden');}};
    Object.defineProperty(contract,'runtimeRoot',{get(){runtimeEntries++;throw new Error('SDK entry forbidden');}});
    const summary=await runTask(contract),raw=await fs.readFile(logPath);
    check(`${plan.id}:hard-ceiling`,raw.length<=ceiling,true);
    check(`${plan.id}:complete-jsonl`,raw.at(-1),10);
    const events=raw.toString('utf8').trimEnd().split('\n').map(line=>JSON.parse(line)),terminal=events.at(-1);
    check(`${plan.id}:one-terminal`,events.filter(event=>event.type==='run_end').length,1);
    check(`${plan.id}:terminal-last`,terminal?.type,'run_end');
    check(`${plan.id}:returned-byte-count`,summary.observedLimits.traceBytes,raw.length);
    check(`${plan.id}:no-sdk-entry`,runtimeEntries,0);
    check(`${plan.id}:no-credential-calls`,credentialCalls,0);
    check(`${plan.id}:no-provider-events`,events.some(event=>event.type.startsWith('provider_')),false);
    check(`${plan.id}:no-model-turns`,summary.turns,0);
    check(`${plan.id}:no-tool-calls`,summary.toolCalls,0);
    const limited=Boolean(plan.limited||plan.compact);
    for(const[label,result]of [['returned',summary],['retained',terminal]]) {
      check(`${plan.id}:${label}-status`,result?.status,limited?'limit_reached':'infrastructure_interrupted');
      check(`${plan.id}:${label}-stop`,result?.stopCause,limited?'trace_byte_limit':null);
      check(`${plan.id}:${label}-complete`,result?.observedLimits?.traceComplete,!limited);
      check(`${plan.id}:${label}-omissions`,result?.observedLimits?.omittedTraceEvents>0,limited);
      check(`${plan.id}:${label}-omitted-bytes`,result?.observedLimits?.omittedTraceUtf8Bytes>0,limited);
    }
    check(`${plan.id}:compact-terminal`,terminal?.summaryOmitted===true,Boolean(plan.compact));
    if(plan.compact) {
      check(`${plan.id}:compact-fields`,terminal?.omittedFields?.includes('model'),true);
      check(`${plan.id}:compact-reason`,typeof terminal?.reason==='string'&&terminal.reason.length>0,true);
    }
    const limits=events.filter(event=>event.type==='trace_limit');
    check(`${plan.id}:limit-event-count`,limits.length,plan.limited?1:0);
    if(plan.limited) {
      check(`${plan.id}:startup-not-written`,events.some(event=>event.type==='run_start'),false);
      check(`${plan.id}:rejected-event-type`,limits[0]?.rejectedEventType,'run_start');
      check(`${plan.id}:rejected-stop`,limits[0]?.stopCause,'trace_byte_limit');
      check(`${plan.id}:rejected-over-allowance`,limits[0]?.rejectedUtf8Bytes>allowance,true);
      check(`${plan.id}:rejected-hash`,/^[a-f0-9]{64}$/.test(limits[0]?.rejectedSha256),true);
      check(`${plan.id}:trace-exception`,summary.exception?.code,'TRACE_BYTE_LIMIT');
      if(plan.startupBytes)check(`${plan.id}:startup-size`,limits[0]?.rejectedUtf8Bytes,plan.startupBytes);
    } else {
      check(`${plan.id}:startup-written`,events[0]?.type,'run_start');
      if(plan.startupBytes)check(`${plan.id}:startup-size`,Buffer.byteLength(JSON.stringify(events[0])+'\n'),plan.startupBytes);
    }
    await put(path.join(outputDir,`${plan.id}.result.json`),summary);
    cases.push({id:plan.id,logPath,sha256:sha(raw),bytes:raw.length,status:summary.status,stopCause:summary.stopCause});
  }
  return {source:agentBinding,checks,cases};
}

/** Native author facade controls, independently compared with Chromium AX. */
export async function browserFacadeControls({startBrowser,ensureTextScale,workspace,scratch,launch={},onBrowser=()=>{}},checks=[]) {
  await put(path.join(workspace,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Native facade controls</title>
<style>body{margin:8px;font-size:16px}button,input,select,textarea{font-size:16px}#glyph::after{content:' +'}#label{font-size:16px}#fixed{font-size:18px;line-height:24px}#fixed.changed{font-size:22px}#inherited{font-size:20px}#child{font-size:inherit}.space{height:1200px}</style>
<button id="glyph">Add</button><button id="hidden-glyph">Add<span aria-hidden="true"> +</span></button>
<span id="reference">Resolved <span aria-hidden="true">decoration</span>label</span><button id="labelled" aria-labelledby="reference">Wrong fallback</button>
<label id="label" for="field">Native field</label><input id="field" value="initial"><label for="choice">Choice</label><select id="choice"><option value="one">One</option><option value="two">Two</option></select>
<details open><summary id="summary">More options</summary><p>Details</p></details>
<div id="custom" role="button" tabindex="0" aria-label="Custom action">Wrong fallback</div><div id="unknown" role="not-a-real-role" tabindex="0">Unknown role text</div>
<button id="hidden" hidden>Never native success</button><button id="aria-hidden" aria-hidden="true">Hidden AX</button>
<button id="long" aria-label="${'L'.repeat(1100)}">Short</button>
<p id="fixed">Fixed pixels</p><div id="inherited"><span id="child">Inherited text</span></div>
<button id="change" onclick="document.getElementById('fixed').classList.toggle('changed')">Change font</button><a id="next" href="/next.html">Next</a><div class="space"></div>
</html>`);
  await put(path.join(workspace,'next.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Next</title><style>#next-fixed{font-size:19px}</style><p id="next-fixed">Navigation text</p><a href="/">Back</a></html>');
  const check=(name,got,actual)=>checks.push({name,want:true,got:Boolean(got),actual});
  const near=(a,b)=>Math.abs(a-b)<0.05,evidence=[];
  const owner=await startBrowser({workspace,scratch:path.join(scratch,'author'),...launch});onBrowser(owner);
  const {page,tools}=owner;
  const invoke=async(action,args={})=>(await tools.invoke(action,args)).details;
  const oracle=async selector=>{
    const handle=await page.$(selector);
    try{return await page.accessibility.snapshot({root:handle,interestingOnly:false});}
    finally{await handle.dispose();}
  };
  const fonts=()=>page.evaluate(()=>Object.fromEntries(['fixed','inherited','child'].map(id=>[id,parseFloat(getComputedStyle(document.getElementById(id)).fontSize)])));
  const geometry=()=>page.evaluate(()=>({focus:document.activeElement.id,scroll:{x:scrollX,y:scrollY},nodes:['fixed','inherited','child'].map(id=>{
    const element=document.getElementById(id),rect=element.getBoundingClientRect();
    return {id,font:getComputedStyle(element).fontSize,inline:element.getAttribute('style'),box:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
  })}));
  try{
    const nativeRead=await invoke('read');
    check('native-root-source',nativeRead.nameSource==='native-accessibility-tree',nativeRead.nativeAX);
    for(const id of ['glyph','hidden-glyph','labelled','field','summary','custom','unknown']) {
      const native=await oracle('#'+id),node=nativeRead.nodes.find(value=>value.id===id);
      check('native-identity-'+id,node?.axStatus==='available'&&node.name===native?.name&&node.role===native?.role,{node,native});
    }
    const byId=id=>nativeRead.nodes.find(node=>node.id===id);
    check('native-exposed-glyph',byId('glyph')?.name.includes('+'),byId('glyph'));
    check('native-hidden-glyph',!byId('hidden-glyph')?.name.includes('+'),byId('hidden-glyph'));
    check('native-labelledby',byId('labelled')?.name==='Resolved label',byId('labelled'));
    check('native-label',byId('field')?.name==='Native field',byId('field'));
    check('native-summary-included',byId('summary')?.name.includes('More options'),byId('summary'));
    for(const id of ['hidden','aria-hidden'])check('native-ignored-'+id,byId(id)?.axStatus==='ignored'&&byId(id).name===null,byId(id));
    const unknown=byId('unknown');
    check('native-authored-role-distinct',unknown?.authoredRole==='not-a-real-role'&&unknown.role!=='not-a-real-role',unknown);
    check('native-name-truncation',byId('long')?.name.length===1024&&byId('long').nameTruncated&&nativeRead.nativeAX.truncated,byId('long'));
    const scoped=await invoke('read',{selector:'#summary'});
    check('native-selector-scope',scoped.nodes.length===1&&scoped.nodes[0].id==='summary'&&scoped.nodes[0].name===byId('summary').name&&scoped.nodes[0].role===byId('summary').role,scoped.nativeAX);
    const baseline=await fonts(),scaled=await invoke('viewport',{name:'text200'}),doubled=await fonts();
    check('text200-fixed-inherited',Object.keys(baseline).every(id=>near(doubled[id],baseline[id]*2)),{baseline,doubled});
    check('text200-context',scaled.authorContext.name==='text200'&&scaled.authorContext.textScale===2&&scaled.authorContext.verified&&scaled.authorContext.method==='computed-font-snapshot-css-px'&&scaled.observed.innerWidth===320&&scaled.observed.innerHeight===900&&scaled.observed.visualViewport.scale===1,scaled);
    await page.focus('#field');
    await page.evaluate(()=>{window.scrollTo(0,100);window.__readMutationCount=0;window.__readObserver=new MutationObserver(records=>window.__readMutationCount+=records.length);window.__readObserver.observe(document,{attributes:true,childList:true,characterData:true,subtree:true});});
    const before=await geometry(),first=await invoke('read'),second=await invoke('read'),after=await geometry();
    const mutations=await page.evaluate(()=>{window.__readObserver.disconnect();return window.__readMutationCount;});
    check('read-observational-geometry',JSON.stringify(before)===JSON.stringify(after)&&mutations===0&&first.authorContext.snapshotId===second.authorContext.snapshotId&&first.authorContext.snapshotId===scaled.authorContext.snapshotId,{before,after,mutations,first:first.authorContext,second:second.authorContext});
    await page.evaluate(()=>document.getElementById('fixed').classList.add('changed'));
    const stale=await invoke('read');
    check('read-stale-observational',!stale.authorContext.verified&&stale.authorContext.snapshotId===scaled.authorContext.snapshotId,stale.authorContext);
    await invoke('click',{selector:'#change'});
    const changed=await invoke('click',{selector:'#change'}),changedFonts=await fonts();
    check('dynamic-font-rebase',changed.authorContext.verified&&changed.authorContext.snapshotId!==scaled.authorContext.snapshotId&&near(changedFonts.fixed,44),{context:changed.authorContext,fonts:changedFonts});
    const filled=await invoke('fill',{selector:'#field',value:'updated'}),selected=await invoke('select',{selector:'#choice',values:['two']}),keyed=await invoke('keyboard',{key:'Tab'});
    check('text200-actions-persist',[filled,selected,keyed].every(value=>value.authorContext.name==='text200'&&value.authorContext.textScale===2&&value.authorContext.verified),{filled:filled.authorContext,selected:selected.authorContext,keyed:keyed.authorContext});
    const shot=await invoke('screenshot');
    check('text200-screenshot',shot.authorContext.verified&&shot.authorContext.snapshotId===keyed.authorContext.snapshotId,shot.authorContext);
    const next=await invoke('navigate',{path:'/next.html'}),nextFont=await page.$eval('#next-fixed',element=>parseFloat(getComputedStyle(element).fontSize));
    check('text200-navigation',next.authorContext.name==='text200'&&next.authorContext.verified&&near(nextFont,38),{context:next.authorContext,nextFont});
    const narrow=await invoke('viewport',{name:'narrow'}),restored=await page.$eval('#next-fixed',element=>parseFloat(getComputedStyle(element).fontSize));
    check('narrow-restores-one',narrow.authorContext.textScale===1&&narrow.authorContext.verified&&near(restored,19),{context:narrow.authorContext,restored});
    await invoke('viewport',{name:'text200'});
    const wide=await invoke('viewport',{name:'wide'}),wideFont=await page.$eval('#next-fixed',element=>parseFloat(getComputedStyle(element).fontSize));
    check('wide-restores-one',wide.authorContext.textScale===1&&wide.authorContext.verified&&near(wideFont,19),{context:wide.authorContext,wideFont});
    evidence.push({fixture:'maintenance-browser-facade-author',...await owner.evidence()});
  }finally{try{await owner.close();}finally{onBrowser(null);}}
  const custodian=await startBrowser({workspace,scratch:path.join(scratch,'custodian'),...launch});onBrowser(custodian);
  try{
    await custodian.page.setViewport({width:320,height:900,deviceScaleFactor:1,isMobile:false,hasTouch:false});
    const ownedScale=await ensureTextScale(custodian.page,2);
    const before=await custodian.page.$eval('#fixed',element=>({font:getComputedStyle(element).fontSize,inline:element.getAttribute('style')}));
    const read=(await custodian.tools.invoke('read')).details,capture=(await custodian.tools.invoke('screenshot')).details;
    const after=await custodian.page.$eval('#fixed',element=>({font:getComputedStyle(element).fontSize,inline:element.getAttribute('style')}));
    check('custodian-scale-noninterference',JSON.stringify(before)===JSON.stringify(after)&&read.authorContext.name===null&&read.authorContext.ownership==='evaluator-controlled'&&read.authorContext.textScale===2&&capture.authorContext.textScale===2&&capture.authorContext.verified&&read.authorContext.snapshotId===ownedScale.snapshotId&&capture.authorContext.snapshotId===ownedScale.snapshotId,{before,after,read:read.authorContext,capture:capture.authorContext});
    evidence.push({fixture:'maintenance-browser-facade-custodian',...await custodian.evidence()});
  }finally{try{await custodian.close();}finally{onBrowser(null);}}
  return {checks,evidence};
}

/** Native behavioral controls; no oracle fixture, author trial, or model call. */
export async function textScaleControls(page,{scaleText,ensureTextScale,observeTextScale,resetTextScale},checks=[]) {
  const fixture=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<style id="control-styles">
:root{--reading-font:22px}*{box-sizing:border-box}body{font:18px/1.5 system-ui;margin:0}
main{padding:24px 20px}h1{font-size:38px;line-height:1.1}h2{font-size:28px;margin:0}
.spacer{height:950px}button{font:14px/1.4 system-ui;padding:12px}select{font:inherit;padding:12px;max-width:100%}
#transcript{font-size:var(--reading-font);line-height:1.8;margin:24px 0}
#transcript[data-size=large]{font-size:30px}#zero{font-size:0;line-height:0}
#scroller{height:120px;overflow:auto}#scroller p{height:400px}
dialog{width:calc(100% - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:20px}
dialog p{font-size:16px;line-height:1.6;margin-bottom:24px}dialog label{font-size:15px}
@media(max-width:400px){#media-font{font-size:17px}}
@supports(display:grid){#supports-font{font-size:19px}}
@property --registered-reading{syntax:"<length>";inherits:true;initial-value:16px}
#registered-rem{--registered-reading:1.25rem;font-size:var(--registered-reading)}
#inherit-small{font-size:13px}#inherit-large{font-size:27px}
#position-parent span:first-child{font-size:23px}#position-parent span:last-child{font-size:31px}
</style><main><h1>Native text-scale maintenance control</h1><div class="spacer"></div>
<button id="opener" data-open-settings>Transcript settings</button>
<p id="transcript" data-size="standard">A retained transcript with an application-selected reading size.</p>
<span id="zero">Zero-sized control</span><p id="media-font">Media font control</p><p id="supports-font">Supports font control</p>
<div id="scroller"><p>Contained scroll stability control</p></div></main>
<div id="inherit-small"><span id="inherited-child">Inherited text</span></div><div id="inherit-large"></div>
<div id="position-parent"><span id="position-first">First</span><span id="position-last">Last</span></div>
<p id="registered-rem">Registered rem dependency</p>
<dialog id="settings"><h2>Transcript settings</h2><p>Choose a reading size. The native modal retains its existing controls and focus.</p>
<label>Transcript text size<select id="size" autofocus><option value="standard">Standard</option><option value="large">Large</option></select></label>
<button id="close">Close settings</button></dialog>
<script>
const dialog=document.querySelector('#settings'),opener=document.querySelector('#opener'),size=document.querySelector('#size');
opener.onclick=()=>{dialog.showModal();size.focus()};
size.onchange=()=>document.querySelector('#transcript').dataset.size=size.value;
document.querySelector('#close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>opener.focus());
</script>`;
  await page.setViewport({width:320,height:900,deviceScaleFactor:1});
  await page.setContent(fixture,{waitUntil:'load'});
  const check=(name,got,actual)=>checks.push({name,want:true,got:Boolean(got),actual});
  const font=(record,id)=>record.observation.elements.find(entry=>entry.id===id);
  const state=()=>page.evaluate(()=>{
    const all=[...document.querySelectorAll('*')],active=document.activeElement;
    const rect=element=>{const value=element.getBoundingClientRect();return {x:value.x,y:value.y,width:value.width,height:value.height};};
    return {active:{index:all.indexOf(active),id:active?.id,rect:rect(active)},scroll:{x:scrollX,y:scrollY},
      snapshot:window.__peccableTextResize.attr,
      rectangles:Object.fromEntries(['opener','settings','size','close','transcript','scroller'].map(id=>[id,rect(document.getElementById(id))])),
      scrollers:all.filter(element=>element.scrollHeight>element.clientHeight||element.scrollWidth>element.clientWidth)
        .map(element=>({index:all.indexOf(element),id:element.id,top:element.scrollTop,left:element.scrollLeft}))};
  });
  const initial=await ensureTextScale(page,2);
  check('initial-real-2x-baseline',initial.verified&&initial.status==='rebased'&&
    font(initial,'transcript').beforeFontPx===22&&font(initial,'transcript').afterFontPx===44,{fixture,initial});
  check('zero-font-is-zero-with-no-invented-ratio',font(initial,'zero').beforeFontPx===0&&
    font(initial,'zero').afterFontPx===0&&font(initial,'zero').ratio===null,font(initial,'zero'));
  check('media-and-supports-font-sources-apply',font(initial,'media-font').beforeFontPx===17&&
    font(initial,'supports-font').beforeFontPx===19,{media:font(initial,'media-font'),supports:font(initial,'supports-font')});
  await page.focus('#opener');await page.keyboard.press('Enter');
  await page.evaluate(()=>{document.querySelector('#scroller').scrollTop=80;return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  const beforeReuse=await state();
  await page.evaluate(()=>{
    window.__scaleControlMutations=[];
    window.__scaleControlObserver=new MutationObserver(records=>window.__scaleControlMutations.push(...records));
    window.__scaleControlObserver.observe(document,{subtree:true,attributes:true,childList:true,characterData:true,attributeOldValue:true});
  });
  const reused=await ensureTextScale(page,2),reusedAgain=await ensureTextScale(page,2),afterReuse=await state();
  const mutations=await page.evaluate(()=>{
    const observer=window.__scaleControlObserver;
    const records=[...window.__scaleControlMutations,...observer.takeRecords()];observer.disconnect();
    return records.map(record=>({type:record.type,id:record.target.id,attribute:record.attributeName,oldValue:record.oldValue,
      value:record.attributeName?record.target.getAttribute(record.attributeName):null,added:record.addedNodes.length,removed:record.removedNodes.length}));
  });
  check('native-modal-correct-snapshot-is-reused',reused.verified&&reusedAgain.verified&&reused.status==='reused'&&
    reusedAgain.status==='reused'&&initial.snapshotId===reused.snapshotId&&reused.snapshotId===reusedAgain.snapshotId,{reused,reusedAgain});
  check('native-modal-focus-scroll-and-rectangles-stable',beforeReuse.active.id==='size'&&beforeReuse.scroll.y>0&&
    JSON.stringify(beforeReuse)===JSON.stringify(afterReuse),{before:beforeReuse,after:afterReuse});
  check('reuse-does-not-write-artifact-dom',mutations.length===0,{mutations});
  // Each genuine-reuse boundary is observed only after its app mutation, so
  // DOM writes from the application cannot be mistaken for scaler writes.
  const unchangedReuse=async(name)=>{
    const before=await state();
    await page.evaluate(()=>{
      window.__boundaryMutations=[];
      window.__boundaryObserver=new MutationObserver(records=>window.__boundaryMutations.push(...records));
      window.__boundaryObserver.observe(document,{subtree:true,attributes:true,childList:true,characterData:true});
    });
    const first=await ensureTextScale(page,2),second=await ensureTextScale(page,2),after=await state();
    const writes=await page.evaluate(()=>{
      const observer=window.__boundaryObserver;
      const count=window.__boundaryMutations.length+observer.takeRecords().length;observer.disconnect();return count;
    });
    check(name,first.verified&&second.verified&&first.status==='reused'&&second.status==='reused'&&
      first.snapshotId===second.snapshotId&&writes===0&&JSON.stringify(before)===JSON.stringify(after),
      {before,after,first,second,writes});
  };
  check('registered-rem-has-true-unscaled-baseline',initial.verified&&
    font(initial,'registered-rem').beforeFontPx===20&&font(initial,'registered-rem').afterFontPx===40,initial);
  await unchangedReuse('registered-rem-does-not-self-invalidate-or-mutate-modal');
  await page.evaluate(()=>document.querySelector('#control-styles').sheet.insertRule('main{outline-color:transparent}',0));
  await unchangedReuse('layout-only-rule-index-shift-reuses-without-dom-focus-scroll-mutation');
  await page.evaluate(()=>{
    const style=document.querySelector('#control-styles').sheet;
    style.insertRule('#transcript{font-weight:700;font-family:serif}',style.cssRules.length);
  });
  await unchangedReuse('unrelated-font-style-reuses-without-dom-focus-scroll-mutation');
  await page.evaluate(()=>document.querySelector('#inherit-large').append(document.querySelector('#inherited-child')));
  const reparentedBefore=await observeTextScale(page),reparented=await ensureTextScale(page,2);
  check('connected-reparent-invalidates-inherited-baseline',!reparentedBefore.verified&&
    reparentedBefore.addedElementCount===0&&reparentedBefore.disconnectedElementCount===0&&
    reparentedBefore.reparentedElements.some(entry=>entry.id==='inherited-child')&&
    reparented.verified&&reparented.status==='rebased'&&font(reparented,'inherited-child').beforeFontPx===27&&
    font(reparented,'inherited-child').afterFontPx===54,{before:reparentedBefore,after:reparented});
  await unchangedReuse('reparented-inheritance-reuses-without-dom-focus-scroll-mutation');
  await page.evaluate(()=>document.querySelector('#position-parent').append(document.querySelector('#position-first')));
  const positionalBefore=await observeTextScale(page),positional=await ensureTextScale(page,2);
  check('positional-selector-change-invalidates-font-baseline',!positionalBefore.verified&&
    positionalBefore.fontSourceChanges.length>0&&positional.verified&&positional.status==='rebased'&&
    font(positional,'position-first').beforeFontPx===31&&font(positional,'position-first').afterFontPx===62&&
    font(positional,'position-last').beforeFontPx===23&&font(positional,'position-last').afterFontPx===46,
    {before:positionalBefore,after:positional});
  await unchangedReuse('positional-baseline-reuses-without-dom-focus-scroll-mutation');
  await page.evaluate(()=>document.querySelector('#registered-rem').style.setProperty('--registered-reading','1.5rem'));
  const registeredBefore=await observeTextScale(page),registered=await ensureTextScale(page,2);
  check('registered-rem-app-dependency-edit-invalidates',!registeredBefore.verified&&
    registeredBefore.fontSourceChanges.length>0&&registered.verified&&registered.status==='rebased'&&
    font(registered,'registered-rem').beforeFontPx===24&&font(registered,'registered-rem').afterFontPx===48,
    {before:registeredBefore,after:registered});
  await unchangedReuse('edited-registered-rem-reuses-without-dom-focus-scroll-mutation');
  await page.focus('#size');await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');
  const selected=await page.$eval('#size',element=>element.value),staleLarge=await observeTextScale(page);
  const beforeLargeRebase=await state();
  const large=await ensureTextScale(page,2);
  check('native-large-choice-invalidates-masked-font-baseline',selected==='large'&&!staleLarge.verified&&
    staleLarge.fontSourceChanges.length>0&&staleLarge.mismatches.length===0,{selected,stale:staleLarge});
  check('native-large-choice-gets-genuine-baseline',large.verified&&large.status==='rebased'&&
    font(large,'transcript').beforeFontPx===30&&font(large,'transcript').afterFontPx===60,large);
  const afterLargeRebase=await state();
  check('genuine-font-rebase-preserves-incoming-modal-focus-and-scroll',
    large.scrollPreservation?.activeUnchanged===true && JSON.stringify(beforeLargeRebase.scroll)===JSON.stringify(afterLargeRebase.scroll) &&
    JSON.stringify(beforeLargeRebase.active)===JSON.stringify(afterLargeRebase.active) &&
    ['settings','size','close'].every(id=>JSON.stringify(beforeLargeRebase.rectangles[id])===JSON.stringify(afterLargeRebase.rectangles[id])),
    {before:beforeLargeRebase,after:afterLargeRebase,preservation:large.scrollPreservation});
  await page.focus('#size');await page.keyboard.press('Home');await page.keyboard.press('Tab');
  await page.evaluate(()=>{const dialog=document.querySelector('#settings');dialog.querySelector('p').style.minHeight='1400px';dialog.scrollTop=0;document.querySelector('#close').focus({preventScroll:true});});
  const existingClipping=await state(),noRepair=await ensureTextScale(page,2),afterNoRepair=await state();
  check('rebase-does-not-scroll-preexisting-clipped-focus-into-view',noRepair.verified &&
    existingClipping.active.rect.y>900 && JSON.stringify(existingClipping.active)===JSON.stringify(afterNoRepair.active) &&
    JSON.stringify(existingClipping.scroll)===JSON.stringify(afterNoRepair.scroll),
    {before:existingClipping,after:afterNoRepair,preservation:noRepair.scrollPreservation});
  await page.$eval('#settings p',element=>element.style.removeProperty('min-height'));
  await page.$eval('#transcript',element=>element.style.setProperty('font-size','37px'));
  const inlineChanged=await observeTextScale(page),inline=await ensureTextScale(page,2);
  check('value-only-inline-font-is-rebased-not-overwritten',!inlineChanged.verified&&inline.verified&&inline.status==='rebased'&&
    inline.preservedInlineMutations>0&&font(inline,'transcript').beforeFontPx===37&&font(inline,'transcript').afterFontPx===74,{before:inlineChanged,after:inline});
  const normalReset=await resetTextScale(page);
  const normalStyle=await page.$eval('#transcript',element=>({value:element.style.getPropertyValue('font-size'),priority:element.style.getPropertyPriority('font-size')}));
  check('reset-preserves-app-inline-value-and-priority',normalStyle.value==='37px'&&normalStyle.priority==='',{reset:normalReset,style:normalStyle});
  await ensureTextScale(page,2);
  await page.$eval('#transcript',element=>element.style.setProperty('font-size','41px','important'));
  const important=await ensureTextScale(page,2),importantReset=await resetTextScale(page);
  const importantStyle=await page.$eval('#transcript',element=>({value:element.style.getPropertyValue('font-size'),priority:element.style.getPropertyPriority('font-size')}));
  check('value-only-important-app-font-survives-rebase-and-reset',important.verified&&important.status==='rebased'&&
    font(important,'transcript').beforeFontPx===41&&font(important,'transcript').afterFontPx===82&&
    importantStyle.value==='41px'&&importantStyle.priority==='important',{scale:important,reset:importantReset,style:importantStyle});
  await ensureTextScale(page,2);
  await page.$eval('#transcript',element=>{const child=document.createElement('span');child.id='added-font';child.textContent=' Newly added inherited text.';element.append(child);});
  const addedBefore=await observeTextScale(page),added=await ensureTextScale(page,2);
  check('added-nodes-cannot-silently-verify',!addedBefore.verified&&addedBefore.addedElementCount===1,addedBefore);
  check('added-inherited-node-rebases-without-compounding',added.verified&&added.status==='rebased'&&
    font(added,'added-font').beforeFontPx===41&&font(added,'added-font').afterFontPx===82,added);
  await resetTextScale(page);
  await page.$eval('#transcript',element=>{element.style.removeProperty('font-size');element.dataset.size='standard';});
  await ensureTextScale(page,2);
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-font','26px'));
  const variableBefore=await observeTextScale(page),variable=await ensureTextScale(page,2);
  check('relevant-custom-property-change-rebases-masked-font',!variableBefore.verified&&variable.verified&&variable.status==='rebased'&&
    font(variable,'transcript').beforeFontPx===26&&font(variable,'transcript').afterFontPx===52,{before:variableBefore,after:variable});
  await page.evaluate(()=>{
    const media=[...document.querySelector('#control-styles').sheet.cssRules].find(rule=>rule instanceof CSSMediaRule);
    media.cssRules[0].style.setProperty('font-size','21px');
  });
  const cssomBefore=await observeTextScale(page),cssom=await ensureTextScale(page,2);
  check('applicable-cssom-font-edit-rebases',!cssomBefore.verified&&cssom.verified&&cssom.status==='rebased'&&
    font(cssom,'media-font').beforeFontPx===21&&font(cssom,'media-font').afterFontPx===42,{before:cssomBefore,after:cssom});
  const forced=await scaleText(page,2);
  check('explicit-scaleText-still-forces-fresh-noncompounded-snapshot',forced.replacedPreviousSnapshot&&
    forced.snapshotId!==cssom.snapshotId&&forced.observation.verified&&font(forced,'transcript').afterFontPx===52,forced);
  await page.evaluate(()=>{
    const sheet=new CSSStyleSheet();sheet.replaceSync('@container (min-width:1px){#transcript{font-size:29px}}');
    document.adoptedStyleSheets=[...document.adoptedStyleSheets,sheet];
  });
  const unsupportedBefore=await observeTextScale(page),unsupported=await ensureTextScale(page,2);
  check('unsupported-font-source-is-explicitly-unverified',!unsupportedBefore.verified&&
    unsupportedBefore.fontSourceUncertainty.length>0&&!unsupported.verified&&unsupported.status==='rebased',
    {before:unsupportedBefore,after:unsupported});
  await resetTextScale(page);
  return checks;
}


async function run(options){
  ensure(options.out&&path.isAbsolute(options.out)&&options.modules&&path.isAbsolute(options.modules)&&options.chrome&&path.isAbsolute(options.chrome),HELP);
  const root=path.resolve(options.out), modules=await fs.realpath(options.modules), chrome=await fs.realpath(options.chrome);
  const harness=path.resolve(options.harness||HERE);
  const sources={holdouts:path.resolve(options.holdouts||path.join(HERE,'fixtures/pilot-v3.json')),evaluator:path.resolve(options.evaluator||path.join(HERE,'fixtures/pilot-v3-evaluator.mjs')),browser:path.join(harness,'pilot-browser.mjs'),runner:path.join(harness,'run-pilot.mjs'),reviewer:path.join(harness,'review-pilot.mjs'),agent:path.join(harness,'pilot-agent.mjs'),worker:path.join(harness,'pilot-worker.mjs'),rubric:path.join(harness,path.basename(harness)==='harness'?'../RUBRIC.md':'RUBRIC.md')};
  const checkout=path.dirname(harness);
  ensure(root!==checkout&&!root.startsWith(`${checkout}${path.sep}`),'Validation storage must be outside the harness checkout');
  await fs.mkdir(root,{mode:0o700});
  await put(path.join(root,'ownership.json'),{purpose:'Immutable oracle inputs, raw positive/negative observations, and consumer-evidence validation; no author trial or adoption score',expiry:'One day after pilot completion; archive compact results before removal',resource_policy:'One isolated browser at a time; at most eight declared state captures per context; 8 MiB and 24 million pixels per full scoped capture; owned profiles retired after each fixture. Owner monitors the combined pilot evidence budget.',cleanup_command:`chmod -R u+w -- ${JSON.stringify(root)} && rm -rf -- ${JSON.stringify(root)}`});
  const frozen=path.join(root,'frozen'), frozenPaths={}, bindings={};
  for(const[name,source]of Object.entries(sources)){
    const destination=path.join(frozen,name==='holdouts'?'holdouts.json':name==='evaluator'?'evaluator.mjs':name==='rubric'?'RUBRIC.md':`harness/${path.basename(source)}`);
    await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(source,destination);await fs.chmod(destination,0o400);
    frozenPaths[name]=destination;bindings[name]=sha(await fs.readFile(destination));
  }
  const validatorSnapshot=path.join(frozen,'validator.mjs');await fs.copyFile(fileURLToPath(import.meta.url),validatorSnapshot);await fs.chmod(validatorSnapshot,0o400);
  bindings.chrome=sha(await fs.readFile(chrome));bindings.driver=sha(await fs.readFile(path.join(modules,'puppeteer-core/package.json')));
  const [{startBrowser,scaleText,ensureTextScale,observeTextScale,resetTextScale},{evaluate,preparePage,oracleFixtures,protocol},{runtimeRecord,mergedAssertions,projectReviewPacket,registry},{captureEvidence},{runTask}]=await Promise.all([import(pathToFileURL(frozenPaths.browser).href),import(pathToFileURL(frozenPaths.evaluator).href),import(pathToFileURL(frozenPaths.reviewer).href),import(pathToFileURL(frozenPaths.runner).href),import(pathToFileURL(frozenPaths.agent).href)]);
  ensure([startBrowser,scaleText,ensureTextScale,observeTextScale,resetTextScale,evaluate,preparePage,oracleFixtures,runtimeRecord,mergedAssertions,projectReviewPacket,registry,captureEvidence,runTask].every(value=>typeof value==='function'),'Incomplete oracle/harness interface');
  const reviewPolicy=(await registry()).evidence_policy;
  const suite=JSON.parse(await fs.readFile(frozenPaths.holdouts,'utf8')), cases=suite.scenarios;
  ensure(Array.isArray(cases)&&cases.length===7,'Exactly seven independently authored cases are required');
  const expectedContexts=[{context_id:'wide',width:1440,height:1000,text_scale:1},{context_id:'narrow',width:320,height:900,text_scale:1},{context_id:'text200',width:320,height:900,text_scale:2}];
  const matchesContexts=contexts=>Array.isArray(contexts)&&contexts.length===expectedContexts.length&&contexts.every((context,index)=>Object.entries(expectedContexts[index]).every(([key,value])=>context[key]===value));
  ensure(matchesContexts(protocol.contexts)&&matchesContexts(suite.protocol.environments),'Fixture/oracle environments disagree with the frozen harness');
  const entries=cases.flatMap(scenario=>oracleFixtures(scenario).map(fixture=>({scenario,fixture})));
  ensure(new Set(entries.map(entry=>entry.fixture.id)).size===entries.length,'Duplicate control identifiers');
  ensure(entries.every(({fixture})=>/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(fixture.id)&&['positive','negative'].includes(fixture.control_type)),'Invalid control identity/type');
  for(const scenario of cases){
    const controls=entries.filter(entry=>entry.scenario.id===scenario.id), ids=scenario.evaluator_assertions.map(spec=>spec.id);
    ensure(Array.isArray(scenario.review_states)&&scenario.review_states.length<=8&&scenario.review_states.every(label=>/^[a-z0-9-]{1,48}$/.test(label)),'Invalid declared review states');
    ensure(['positive','negative'].every(type=>controls.filter(entry=>entry.fixture.control_type===type).length>=2),'Each case requires two compliant alternatives and two negative controls');
    for(const{fixture}of controls)ensure(Object.keys(fixture.expected_assertions||{}).length===ids.length&&ids.every(id=>Object.hasOwn(fixture.expected_assertions,id)&&['pass','fail','unverified','not_applicable'].includes(fixture.expected_assertions[id])),'Every control must declare every expected assertion');
    for(const{fixture}of controls.filter(entry=>entry.fixture.control_type==='positive'))ensure(scenario.evaluator_assertions.filter(spec=>spec.method==='runtime').every(spec=>fixture.expected_assertions[spec.id]==='pass'),'A compliant positive must expect passing runtime observations');
    ensure(controls.some(entry=>entry.fixture.control_type==='negative'&&Object.values(entry.fixture.expected_assertions).includes('fail')),'Each case requires an observable negative control; manual challenges alone are insufficient');
  }
  const safety=[{kind:'behavioral',state:'pass',actual:true,want:'pass'},{kind:'measured',state:'pass',actual:true,want:'pass'},{kind:'source',state:'pass',actual:true,want:'unverified'},{kind:'rendered',state:'pass',actual:true,want:'unverified'},{kind:null,state:'pass',actual:true,want:'unverified'},{kind:'behavioral',state:'unverified',actual:true,want:'unverified'},{kind:'behavioral',state:'fail',actual:true,want:'fail'},{kind:'behavioral',state:'pass',actual:false,want:'unverified'}].map(value=>({...value,got:runtimeRecord({id:'probe',method:'runtime'},{evaluation:{contexts:[{context_id:'wide',result:{assertions:[{id:'probe',result:value.state,evidence:value.kind?{kind:value.kind}:undefined,...(value.actual?{actual:{probe:true}}:{})}]}}]}},['wide']).result}));
  const results=[],errors=[],browsers=[],visualGaps=[],textScalingSafety=[],browserFacadeSafety=[],traceCeilingSafety=[];
  const runtimeCoverageSafety=runtimeCoverageControls(runtimeRecord,mergedAssertions);
  let traceCeilingEvidence=null,activeBrowser=null,interrupted=false;
  const interrupt=()=>{interrupted=true;void activeBrowser?.close().catch(error=>errors.push({cleanup_error:String(error)}));};
  process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
  const record=async(scenario,fixture,context,result,frames=[])=>{
    const consumer=scenario.evaluator_assertions.filter(spec=>spec.method==='runtime').map(spec=>{const observed=result.assertions.find(assertion=>assertion.id===spec.id);return{id:spec.id,want:observed?.result,got:runtimeRecord(spec,{evaluation:{contexts:[{context_id:context,result}]}},[context]).result};});
    if(fixture.control_type==='positive'&&context!=='planning')for(const label of scenario.review_states)if(!frames.some(frame=>frame.label===label))visualGaps.push({fixture:fixture.id,context,label});
    const row={id:fixture.id,control_type:fixture.control_type,context,expected:fixture.expected_assertions,result,consumer,stateScreenshots:frames};
    results.push(row);await fs.appendFile(path.join(root,'observations.jsonl'),`${JSON.stringify(row)}\n`);
  };
  try{
    try{
      const directory=path.join(root,'trace-ceiling-boundaries');await fs.mkdir(directory);
      traceCeilingEvidence=await traceCeilingControls(runTask,directory,{path:frozenPaths.agent,sha256:bindings.agent},traceCeilingSafety);
      await put(path.join(directory,'observations.json'),traceCeilingEvidence);
    }catch(error){errors.push({fixture:'maintenance-trace-ceiling',error:String(error.stack||error)});}
    try{
      const directory=path.join(root,'browser-facade-boundaries');
      const facade=await browserFacadeControls({startBrowser,ensureTextScale,workspace:path.join(directory,'workspace'),scratch:path.join(directory,'scratch'),
        launch:{executablePath:chrome,codingAgentPackage:path.join(modules,'@oh-my-pi/pi-coding-agent/package.json')},onBrowser:value=>{activeBrowser=value;}},browserFacadeSafety);
      browsers.push(...facade.evidence);
    }catch(error){errors.push({fixture:'maintenance-browser-facade',error:String(error.stack||error)});}
    finally{
      try{await put(path.join(root,'browser-facade-boundaries/observations.json'),browserFacadeSafety);}
      catch(error){errors.push({fixture:'maintenance-browser-facade',evidence_error:String(error)});}
    }
    let controlBrowser;
    try{
      const directory=path.join(root,'text-scale-boundaries'),workspace=path.join(directory,'workspace');
      await put(path.join(workspace,'index.html'),'<!doctype html><title>Maintenance text-scale controls</title>');
      controlBrowser=activeBrowser=await startBrowser({workspace,scratch:path.join(directory,'scratch'),executablePath:chrome,codingAgentPackage:path.join(modules,'@oh-my-pi/pi-coding-agent/package.json')});
      await textScaleControls(controlBrowser.page,{scaleText,ensureTextScale,observeTextScale,resetTextScale},textScalingSafety);
      browsers.push({fixture:'maintenance-text-scale',...await controlBrowser.evidence()});
    }catch(error){errors.push({fixture:'maintenance-text-scale',error:String(error.stack||error)});}
    finally{
      try{await put(path.join(root,'text-scale-boundaries/observations.json'),textScalingSafety);}
      catch(error){errors.push({fixture:'maintenance-text-scale',evidence_error:String(error)});}
      if(controlBrowser)try{await controlBrowser.close();}catch(error){errors.push({fixture:'maintenance-text-scale',cleanup_error:String(error)});}activeBrowser=null;
    }
    for(const{scenario,fixture}of entries){
      if(interrupted)break;let browser;
      try{
        const workspace=path.join(root,fixture.id,'workspace');await fs.mkdir(workspace,{recursive:true});
        for(const[name,value]of Object.entries(fixture.files||{})){const target=path.join(workspace,relative(name));await put(target,value);}
        const before=Object.keys(scenario.starter_files).sort().map(name=>[name,sha(scenario.starter_files[name])]);
        const after=await Promise.all(Object.keys(fixture.files||{}).sort().map(async name=>[name,sha(await fs.readFile(path.join(workspace,name)))]));
        const artifacts={...fixture.artifacts,unchanged:JSON.stringify(before)===JSON.stringify(after),unchanged_inventory_reference:'oracle/source-inventory',source_inventory:{before,after}};
        const handoff=fixture.handoff||{text:artifacts.plan||'Oracle validation only',reference:'oracle/handoff'};
        if(fixture.kind==='planning'){await record(scenario,fixture,'planning',await evaluate(null,scenario,{context_id:'planning',artifacts,handoff,trace:{complete:true,reference:'oracle/trace'}}));continue;}
        browser=activeBrowser=await startBrowser({workspace,scratch:path.join(root,fixture.id,'scratch'),executablePath:chrome,codingAgentPackage:path.join(modules,'@oh-my-pi/pi-coding-agent/package.json'),navigateOnStart:false});
        await preparePage(browser.page,scenario);const cdp=await browser.page.createCDPSession();browsers.push({fixture:fixture.id,...await browser.evidence()});
        for(const environment of protocol.contexts){
          if(interrupted)break;
          const{context_id,width,height,text_scale}=environment, frames=[];
          await browser.page.setViewport({width,height,deviceScaleFactor:1});await cdp.send('Storage.clearDataForOrigin',{origin:browser.origin,storageTypes:'all'});await browser.page.goto(browser.origin,{waitUntil:'networkidle0'});
          const scaleSnapshots=[];
          const observe=()=>observeTextScale(browser.page);
          const establish=async()=>{const value=await ensureTextScale(browser.page,2);scaleSnapshots.push(value);ensure(value.verified,'Text scaling could not be verified');return value;};
          const captureState=async label=>{
            ensure(typeof label==='string'&&/^[a-z0-9-]{1,48}$/.test(label)&&scenario.review_states.includes(label),'Undeclared review state');
            ensure(frames.length<8&&!frames.some(frame=>frame.label===label),'Duplicate or excessive state capture');
            if(text_scale===2)await establish();
            const directory=path.join(root,fixture.id,'evidence');await fs.mkdir(directory,{recursive:true});
            const frame=await captureEvidence(browser.page,directory,`${context_id}-state-${label}.png`,{evaluatorScreenshotPixels:24000000,evaluatorScreenshotBytes:8388608});
            const verifiedScale=text_scale===2?await observe():null;ensure(!verifiedScale||verifiedScale.verified,'Named-state text scaling was not verified');
            const value={label,context_id,text_scale,...frame,verifiedScale};frames.push(value);return value;
          };
          const context={context_id,text_scale,text_scaling_evidence:text_scale===2?{method:'computed-font-snapshot-css-px',evidence_path:'oracle/text-scale'}:null,trace:{complete:true,reference:'oracle/trace'},handoff,artifacts,ensureTextScale:text_scale===2?establish:undefined,observeTextScale:text_scale===2?observe:undefined,captureState};
          let timer;
          try{
            const result=await Promise.race([evaluate(browser.page,scenario,context),new Promise((_,reject)=>{timer=setTimeout(()=>{void browser.close();reject(new Error('Oracle context exceeded 180 seconds'));},180000);})]);
            await record(scenario,fixture,context_id,result,frames);
          }finally{
            clearTimeout(timer);
            if(text_scale===2)await put(path.join(root,fixture.id,'evidence',`${context_id}-text-scale.json`),{snapshots:scaleSnapshots,final:await observe()});
          }
        }
      }catch(error){errors.push({fixture:fixture.id,error:String(error.stack||error)});}finally{if(browser)try{await browser.close();}catch(error){errors.push({fixture:fixture.id,cleanup_error:String(error)});}activeBrowser=null;}
    }
  }finally{process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);if(activeBrowser)await activeBrowser.close();}
  const mismatches=[];
  for(const row of results){for(const[id,want]of Object.entries(row.expected||{})){const observed=row.result.assertions.find(assertion=>assertion.id===id);if(observed?.result!==want)mismatches.push({fixture:row.id,context:row.context,id,want,got:observed?.result,actual:observed?.actual,evidence:observed?.evidence});}for(const check of row.consumer)if(check.got!==check.want)mismatches.push({fixture:row.id,context:row.context,...check,consumer:true});}
  mismatches.push(...safety.filter(check=>check.want!==check.got).map(check=>({consumer_safety:true,...check})));
  const reconciliationSafety=consumerControls(mergedAssertions);
  mismatches.push(...reconciliationSafety.filter(check=>check.want!==check.got).map(check=>({reconciliation_safety:true,...check})));
  mismatches.push(...textScalingSafety.filter(check=>check.want!==check.got).map(check=>({text_scale_safety:true,...check})));
  mismatches.push(...runtimeCoverageSafety.filter(check=>check.want!==check.got).map(check=>({runtime_coverage_safety:true,...check})));
  mismatches.push(...browserFacadeSafety.filter(check=>check.want!==check.got).map(check=>({browser_facade_safety:true,...check})));
  mismatches.push(...traceCeilingSafety.filter(check=>check.want!==check.got).map(check=>({trace_ceiling_safety:true,...check})));
  // These two retained V3-01 alternatives were observation-only in an earlier
  // throwaway probe; the full validator must compare their actual expectations.
  const nativePositiveCoverage=['V3-01-positive-native','V3-01-positive-alternate'].flatMap(id=>expectedContexts.map(({context_id})=>{
    const row=results.find(value=>value.id===id&&value.context===context_id);
    const pass=Boolean(row)&&Object.entries(row.expected).every(([key,want])=>row.result.assertions.find(assertion=>assertion.id===key)?.result===want);
    return {name:`${id}:${context_id}:expected-observations`,want:true,got:pass};
  }));
  mismatches.push(...nativePositiveCoverage.filter(check=>check.want!==check.got).map(check=>({native_positive_coverage:true,...check})));
  const packetTextChecks=[];
  for(const{scenario,fixture}of entries){
    const observations=results.filter(row=>row.id===fixture.id);
    if(!observations.length)continue;
    const evidence={'evidence/evaluation.json':{contexts:observations.map(row=>({context_id:row.context,result:row.result,stateScreenshots:row.stateScreenshots}))}};
    const raw={brief:scenario.agent_brief,input_fixture:scenario.input_fixture,starter_files:scenario.starter_files,permission_mode:scenario.permission_mode,source_files:fixture.files,handoff:fixture.handoff||{},trace:{complete:false,events:[],scope:'Control fixture, not an author run'},assertion_specs:scenario.evaluator_assertions,assertion_evidence:observations[0].result.assertions,evidence,review_states:scenario.review_states,supplied_images:observations.flatMap(row=>row.stateScreenshots.map(frame=>frame.screenshot))};
    const projected=projectReviewPacket(raw,Object.keys(evidence));
    const bytes=Buffer.byteLength(json(projected));
    const check={fixture:fixture.id,control_type:fixture.control_type,raw_utf8_bytes:Buffer.byteLength(json(raw)),delivered_utf8_bytes:bytes,maximum_utf8_bytes:reviewPolicy.maximum_packet_utf8_bytes,within_bound:bytes<=reviewPolicy.maximum_packet_utf8_bytes,scope:'Complete retained control observations and declared-state metadata; no author trace or model judgment. Actual trial packets require their own integrity/size check.'};
    packetTextChecks.push(check);
    if(fixture.control_type==='positive'&&!check.within_bound)mismatches.push({packet_text_bound:true,...check});
  }
  for(const browser of browsers)if(browser.binarySha256!==bindings.chrome||browser.observedEnvironment?.locale!=='en-US'||browser.observedEnvironment?.timezone!=='UTC'||browser.observedEnvironment?.light!==true)errors.push({fixture:browser.fixture,error:'Actual browser identity/environment differs from validation registration'});
  const resultPath=path.join(root,'results.json');await put(resultPath,{results,errors,browsers,safety,reconciliationSafety,runtimeCoverageSafety,textScalingSafety,browserFacadeSafety,traceCeilingSafety,traceCeilingEvidence,nativePositiveCoverage,packetTextChecks,visualGaps});await put(path.join(root,'mismatches.json'),mismatches);
  const expectedObservations=entries.reduce((count,{fixture})=>count+(fixture.kind==='planning'?1:protocol.contexts.length),0);
  const calibrationCounts={runtime_coverage:runtimeCoverageSafety.length,browser_facade:browserFacadeSafety.length,trace_ceiling:traceCeilingSafety.length,text_scale:textScalingSafety.length};
  const receipt={
    schema_version:'peccable-oracle-validation-v1',
    ready:!interrupted&&!mismatches.length&&!errors.length&&!visualGaps.length&&results.length===expectedObservations&&Object.values(calibrationCounts).every(count=>count>0),
    finished_at:new Date().toISOString(),cases:cases.length,
    positive_controls:entries.filter(entry=>entry.fixture.control_type==='positive').length,
    negative_controls:entries.filter(entry=>entry.fixture.control_type==='negative').length,
    manual_negative_challenges:entries.filter(entry=>entry.fixture.control_type==='negative'&&!Object.values(entry.fixture.expected_assertions).includes('fail')).map(entry=>entry.fixture.id),
    observations:results.length,expected_observations:expectedObservations,mismatches:mismatches.length,
    errors,visual_gaps:visualGaps,interrupted,bindings,protocol,consumer_safety:safety,
    reconciliation_safety:reconciliationSafety,text_scale_safety:textScalingSafety.map(({name,want,got})=>({name,want,got})),packet_text_checks:packetTextChecks,
    runtime_coverage_safety:runtimeCoverageSafety,browser_facade_safety:browserFacadeSafety.map(({name,want,got})=>({name,want,got})),
    trace_ceiling_safety:traceCeilingSafety,calibration_counts:calibrationCounts,native_positive_coverage:nativePositiveCoverage,
    results:{path:resultPath,sha256:sha(await fs.readFile(resultPath))},
    validator:{path:validatorSnapshot,sha256:sha(await fs.readFile(validatorSnapshot))},
    source_snapshot:frozen,runtime:{bun:Bun.version,chrome,modules},
    disclosure:'Mechanical oracle, named-state capture, packet-text bounds, and review-consumer boundary validation only. Controls contain no author run; actual trial packets need their own integrity/size checks. Manual semantic/planning/visual judgments remain independent-review requirements, not self-certified control passes. Sources were snapshotted before imports; failures and missing observations remain recorded.',
  };
  await put(path.join(root,'receipt.json'),receipt);
  process.stdout.write(json({ready:receipt.ready,cases:cases.length,fixtures:entries.length,positive:receipt.positive_controls,negative:receipt.negative_controls,observations:results.length,errors,visual_gaps:visualGaps,mismatches:mismatches.map(({actual,evidence,...check})=>check),receipt:path.join(root,'receipt.json')}));
  if(!receipt.ready)process.exitCode=1;
}
if(import.meta.main){try{await run(parse(process.argv.slice(2)));}catch(error){process.stderr.write(`${String(error.stack||error)}\n`);process.exitCode=1;}}
