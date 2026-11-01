// Independent v3 cohort oracle. No candidate, historical fixture, or result imports.
// Run only through the pinned harness. Control generation performs no browser work.
export const protocol = Object.freeze({
  contexts: [{context_id:'wide',width:1440,height:1000,text_scale:1},{context_id:'narrow',width:320,height:900,text_scale:1},{context_id:'text200',width:320,height:900,text_scale:2}],
  defaults: {color_scheme:'light',locale:'en-US',timezone:'UTC'},
  independent_record: 'assertion_id, result, origin=independent_review, independence_confirmed=true, reviewer_id, actual, evidence:[{location,...}]',
  print_scope: 'Intercepting window.print measures a real keyboard-initiated API request, not the operating-system print dialog or printed layout; those remain independent review.'
});
const results = new Set(['pass','fail','unverified','not_applicable']);
const norm = value => String(value ?? '').replace(/\s+/g,' ').trim();
const equalText = (actual, expected) => norm(actual) === norm(expected);
// Data hooks may contain presentation labels as well as the complete supplied text.
// Numeric/date truth and semantic contradictions remain separate checks.
const preservesText = (actual, expected) => norm(actual).includes(norm(expected));
// This validates unknown-label shape only. Meaning is a mandatory data/review
// assertion, so no private vocabulary is an automated semantic oracle.
const unknownShape = text => /\p{L}/u.test(norm(text)) && !/\d/.test(text);
const numericToken = text => {
  const matches=norm(text).replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'').match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)/g);
  return matches?.length===1 ? matches[0] : null;
};
const number = text => {const token=numericToken(text);return token===null ? null : Number(token);};
const dateMatches = (text, expected) => {
  if(expected === null) return unknownShape(text);
  if(!norm(text)) return false;
  const stamp = Date.parse(norm(text));
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0,10) === expected;
};
const flatten = tree => tree ? [tree,...(tree.children || []).flatMap(flatten)] : [];
const hasAX = (tree, role, name) => flatten(tree).some(n=>n.role===role && typeof n.name==='string' && n.name.trim()===name);
const all = observations => observations.every(o=>o.ok);

// Geometry and text are observed in the browser; names never use a DOM approximation.
async function node(page, selector, ax = false) {
  const element = await page.$(selector);
  if(!element) return {selector,exists:false,visible:false,text:null,ax:null};
  try {
    const observation = await element.evaluate(el=>{
      const rect=el.getBoundingClientRect(), style=getComputedStyle(el);
      const browserVisibility=el.checkVisibility({opacityProperty:true,visibilityProperty:true});
      let visible=rect.width>0 && rect.height>0 && browserVisibility;
      for(let parent=el;parent;parent=parent.parentElement){const s=getComputedStyle(parent);if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse'||Number(s.opacity)===0) visible=false;}
      return {exists:true,visible,browser_visibility:browserVisibility,text:el.innerText ?? el.textContent ?? '',value:'value' in el ? el.value : null,state:el.getAttribute('data-state'),data_size:el.getAttribute('data-size'),unit:el.getAttribute('data-unit'),expanded:el.getAttribute('aria-expanded'),disabled:'disabled' in el ? el.disabled : null,aria_disabled:el.getAttribute('aria-disabled'),read_only:'readOnly' in el ? el.readOnly : null,focused:document.activeElement===el,rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height},display:style.display};
    });
    return {selector,...observation,ax:ax ? await page.accessibility.snapshot({root:element,interestingOnly:false}) : null};
  } finally {await element.dispose();}
}
function quantity(observation, expected, base) {
  if(!observation.exists || !observation.visible) return false;
  if(expected === null) return observation.state==='unknown' && unknownShape(observation.text);
  const factors=base==='g' ? {g:1,kg:1000} : {'mg/L':1,'ug/L':0.001,'μg/L':0.001};
  const token=numericToken(observation.text),value=token===null?null:Number(token),factor=factors[observation.unit];
  const visibleUnits=base==='g' ? norm(observation.text).match(/\b(?:g|kg)\b/g) : norm(observation.text).match(/(?:mg|ug|μg)\s*\/\s*L/g);
  if(observation.state!=='known'||value===null||!Number.isFinite(factor)||visibleUnits?.length!==1||visibleUnits[0].replace(/\s/g,'')!==observation.unit) return false;
  if(expected===0) return value===0;
  const converted=value*factor,epsilon=1e-10*Math.max(1,Math.abs(expected));
  if(Math.abs(converted-expected)<=epsilon) return true;
  const precision=token.includes('.') ? token.split('.')[1].length : 0;
  const increment=10**(-precision)*factor;
  if(increment>(base==='g'?1:0.01)+epsilon) return false;
  return Math.abs(value-Number((expected/factor).toFixed(precision)))<=epsilon/factor;
}
function reviewed(assertion, context) {
  const record=(context.evidence_records || []).find(r=>r.assertion_id===assertion.id && r.origin==='independent_review' && r.independence_confirmed===true && typeof r.reviewer_id==='string' && r.reviewer_id.trim() && results.has(r.result) && r.result!=='not_applicable' && Object.hasOwn(r,'actual') && Array.isArray(r.evidence) && r.evidence.length>0 && r.evidence.every(e=>typeof e.location==='string' && e.location));
  return record ? {result:record.result,actual:record.actual,evidence:record.evidence,reviewer_id:record.reviewer_id} : {result:'unverified',actual:{independent_review_received:false},evidence:[{location:assertion.method==='planning' ? 'handoff' : 'blind-packet.json',observation:'Independent review required; source plausibility and control authorship are not review evidence.'}]};
}

// The owner calls this once on about:blank, before any scored navigation.
// Existing artifact handlers may retain print.bind(window) at initialization.
// The service wrapper returns the original promise, preserving results and timing.
async function keyboardPress(page, chord) {
  const keys=chord.split('+'),key=keys.pop();
  for(const modifier of keys)await page.keyboard.down(modifier);
  try{await page.keyboard.press(key);}finally{for(const modifier of keys.reverse())await page.keyboard.up(modifier);}
}
export async function preparePage(page, scenario) {
  await page.evaluateOnNewDocument(id=>{
    const observations={prepared:true,print_requests:[],service_calls:[],state_changes:[],submit_keys:[]};
    Object.defineProperty(window,'__v3Observation',{get:()=>structuredClone(observations)});
    if(id==='V3-06') window.print=()=>{observations.print_requests.push({at:performance.now()});};
    if(id==='V3-03') {
      document.addEventListener('keydown',event=>{const control=event.target.closest?.('[data-send],[data-retry]');if(event.key==='Enter'&&control)observations.submit_keys.push({at:performance.now(),selector:control.matches('[data-send]')?'[data-send]':'[data-retry]',trusted:event.isTrusted});},true);
      new MutationObserver(records=>{for(const record of records) if(record.target.matches?.('[data-composer]')) observations.state_changes.push({state:record.target.getAttribute('data-state'),at:performance.now()});}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-state']});
      window.addEventListener('notice-service-ready',()=>{
        const service=window.noticeService,original=service.send;
        service.send=function(...args){
          const record={message:args[0],started_at:performance.now(),status:'pending',settled_at:null,result:null,error:null};
          observations.service_calls.push(record);
          let promise;
          try{promise=Reflect.apply(original,this,args);}catch(error){record.status='rejected';record.error=String(error.message||error);record.settled_at=performance.now();throw error;}
          promise.then(value=>{record.status='fulfilled';record.result=structuredClone(value);record.settled_at=performance.now();},error=>{record.status='rejected';record.error=String(error.message||error);record.settled_at=performance.now();});
          return promise;
        };
      },{once:true});
    }
  },scenario.id);
}

export async function evaluate(page, scenario, context = {}) {
  const assertions = scenario.evaluator_assertions.map(spec=>({id:spec.id,category:spec.category,requirement:spec.requirement,method:spec.method,result:'unverified',actual:null,evidence:[],consequence:spec.category==='design'?'Design judgment only.':'A demonstrated failure is noncompensable.'}));
  const measurements=[],state_captures=[];
  const location = 'evidence/evaluation.json';
  const set = (id,result,actual,evidence=[]) => {
    const target=assertions.find(a=>a.id===id);
    if(!target) throw new Error(`Undeclared assertion ${id}`);
    Object.assign(target,{result,actual,evidence:{kind:(id.endsWith('-data')||id.endsWith('-ledger')||id.endsWith('-balance')||id.endsWith('-flow')||id.endsWith('-unchanged'))?'measured':'behavioral',location,context_id:context.context_id || 'planning',assertion_id:id,actual,observation:'Locate contexts[] by context_id, then result.assertions[] by id.',records:evidence}});
  };
  for(const assertion of assertions) if(assertion.method!=='runtime') Object.assign(assertion,reviewed(assertion,context));
  if(scenario.id==='V3-05') {
    const actual={unchanged:context.artifacts?.unchanged ?? null,inventory_reference:context.artifacts?.unchanged_inventory_reference ?? null};
    set('V3-05-unchanged',actual.unchanged===true?'pass':actual.unchanged===false?'fail':'unverified',actual,[{location:actual.inventory_reference || 'artifact-freeze.json',observation:'Inventory comparison only; plan and overall authority are independently reviewed.'}]);
    return {scenario_id:scenario.id,context_id:context.context_id || 'planning',assertions,measurements,state_captures};
  }
  let ready=false;
  const prepare = async label => {
    const expected=protocol.contexts.find(c=>c.context_id===context.context_id);
    if(!expected) throw new Error('A declared viewport/text context is required.');
    if(context.text_scale!==expected.text_scale) throw new Error('Text-scale context does not match the declared environment.');
    if(expected.text_scale===2) {
      if(typeof context.ensureTextScale!=='function' || typeof context.observeTextScale!=='function') throw new Error('Verified renderer text-scaling callbacks unavailable.');
      const established=await context.ensureTextScale();
      const observed=await context.observeTextScale();
      measurements.push({label,established,observed});
      if(established?.verified!==true || observed?.verified!==true) throw new Error('Actual text scaling was not verified.');
    }
    const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,device_scale:devicePixelRatio}));
    measurements.push({label,viewport});
    if(viewport.width!==expected.width || viewport.height!==expected.height || viewport.device_scale!==1) throw new Error('Measured viewport/device scale differs from the declared environment.');
  };
  const observe = async (label, fn) => {await prepare(label);return fn();};
  // Captures are review evidence, never automatic visual/a11y quality passes.
  // Missing callbacks, missing states, and capture failures remain explicit.
  const capture=async(label,established=true,details={})=>{
    if(typeof context.captureState!=='function'){state_captures.push({label,result:'unverified',reason:'Trusted state-capture callback unavailable.',...details});return;}
    try{
      await prepare(`Visual state ${label}`);
      const actualEstablished=typeof established==='function'?await established():established;
      if(!actualEstablished){state_captures.push({label,result:'unverified',reason:'The requested review state was not established.',established:actualEstablished,...details});return;}
      const record=await context.captureState(label);
      const complete=record?.label===label&&typeof record.screenshot==='string'&&record.screenshot.length>0&&record.dimensions&&record.text_scale===context.text_scale;
      state_captures.push({label,result:complete?'captured':'unverified',established:actualEstablished,...details,actual:record??null,...(complete?{screenshot:record.screenshot,dimensions:record.dimensions,text_scale:record.text_scale}:{reason:'Capture callback did not provide the declared measured record.'})});
    }catch(error){state_captures.push({label,result:'unverified',reason:String(error?.message||error),...details});}
  };
  const run = async (suffix, fn) => {
    const id=`${scenario.id}-${suffix}`;
    try {const observed=await fn();set(id,observed.result || (observed.ok?'pass':'fail'),observed.actual);}
    catch(error) {set(id,'unverified',{error:String(error?.message || error),runtime_available:!!page},[{location:`evidence/${context.context_id || 'unknown'}.png`,observation:'Incomplete runtime observation; not a passing result.'}]);}
  };
  const reach = async selector => {
    const focus=[];
    const limit=await observe('Keyboard traversal bound',()=>page.evaluate(()=>document.querySelectorAll('*').length+2));
    for(let i=0;i<limit;i++) {
      const current=await observe(`Keyboard focus ${selector} ${i}`,()=>page.evaluate(sel=>({matches:document.activeElement?.matches(sel) || false,tag:document.activeElement?.tagName || null,hook:document.activeElement?.outerHTML?.slice(0,1200) || null}),selector));
      focus.push(current);
      if(current.matches) return {reached:true,focus};
      await page.keyboard.press('Tab');
    }
    return {reached:false,focus};
  };
  const disclosure = async (trigger, content, name, expected) => {
    const before=await observe('Disclosure initial state',async()=>({trigger:await node(page,trigger,true),content:await node(page,content)}));
    const reached=await reach(trigger);
    const waitExpanded=async expanded=>{
      if(!reached.reached)return {matched:false,expected:expanded,reason:'Trigger not keyboard reachable.'};
      try{await page.waitForFunction((selector,value)=>document.querySelector(selector)?.getAttribute('aria-expanded')===value,{timeout:1500,polling:'mutation'},trigger,expanded);return {matched:true,expected:expanded};}
      catch(error){if(error.name!=='TimeoutError')throw error;return {matched:false,expected:expanded,error:String(error.message)};}
    };
    if(reached.reached) {await prepare('Disclosure keyboard open');await page.keyboard.press('Enter');}
    const openWait=await waitExpanded('true');
    const opened=await observe('Disclosure open state',async()=>({trigger:await node(page,trigger,true),content:await node(page,content)}));
    await capture(scenario.id==='V3-01'?'instructions-open':'method-open',openWait.matched&&opened.trigger.expanded==='true'&&opened.content.visible);
    if(reached.reached) {await prepare('Disclosure keyboard close');await page.keyboard.press('Enter');}
    const closeWait=await waitExpanded('false');
    const closed=await observe('Disclosure closed state',async()=>({trigger:await node(page,trigger,true),content:await node(page,content)}));
    const nameOK=['button','DisclosureTriangle'].some(role=>hasAX(before.trigger.ax,role,name));
    return {ok:before.trigger.visible && before.trigger.expanded==='false' && !before.content.visible && reached.reached && nameOK && openWait.matched && opened.trigger.expanded==='true' && opened.content.visible && norm(opened.content.text).includes(norm(expected)) && closeWait.matched && closed.trigger.expanded==='false' && !closed.content.visible,actual:{before,reached,openWait,opened,closeWait,closed,name_matches:nameOK}};
  };
  if(!page) {
    for(const assertion of assertions) if(assertion.method==='runtime') set(assertion.id,'unverified',{runtime_available:false});
    return {scenario_id:scenario.id,context_id:context.context_id,assertions,measurements,state_captures};
  }
  try {await prepare('Initial environment');ready=true;} catch(error) {
    for(const assertion of assertions) if(assertion.method==='runtime') set(assertion.id,'unverified',{environment_error:String(error?.message || error)});
  }
  if(!ready) return {scenario_id:scenario.id,context_id:context.context_id,assertions,measurements,state_captures};
  const fixture=scenario.input_fixture;
  if(scenario.id==='V3-01') {
    await run('data',async()=>observe('Pickup data',async()=>{
      const brand=await node(page,'[data-brand]'),place=await node(page,'[data-pickup-place]'),lots=[];
      for(const lot of fixture.lots){const scope=`[data-lot="${lot.id}"]`;const observed={id:lot.id,variety:await node(page,`${scope} [data-variety]`),packets:await node(page,`${scope} [data-packets]`),shelf:await node(page,`${scope} [data-shelf]`)};lots.push({...observed,ok:observed.variety.visible && equalText(observed.variety.text,lot.variety) && observed.packets.visible && number(observed.packets.text)===lot.packets && observed.shelf.visible && equalText(observed.shelf.text,lot.shelf)});}
      return {ok:brand.visible && equalText(brand.text,fixture.brand) && place.visible && equalText(place.text,fixture.pickup_place) && all(lots),actual:{brand,place,lots}};
    }));
    let observed;
    await run('disclosure',async()=>{observed=await disclosure('[data-instructions-toggle]','[data-instructions]','Pickup instructions',fixture.instructions);return observed;});
    set('V3-01-name',observed ? (observed.actual.name_matches && observed.actual.reached.reached?'pass':'fail'):'unverified',observed ? {trigger:observed.actual.before.trigger,keyboard:observed.actual.reached} : {runtime_observation_missing:true});
  } else if(scenario.id==='V3-02') {
    const ledger=[],balance=[];
    await run('ledger',async()=>observe('Material ledger',async()=>{
      for(const material of fixture.materials){const scope=`[data-material="${material.id}"]`;const observed={id:material.id,name:await node(page,`${scope} [data-material-name]`),received:await node(page,`${scope} [data-received]`),issued:await node(page,`${scope} [data-issued]`)};ledger.push({...observed,ok:observed.name.visible && equalText(observed.name.text,material.name) && quantity(observed.received,material.received_g,'g') && quantity(observed.issued,material.issued_g,'g')});}
      return {ok:all(ledger),actual:{materials:ledger}};
    }));
    await run('balance',async()=>observe('Material balances',async()=>{
      let expectedTotal=0,incomplete=0;
      for(const material of fixture.materials){const expected=material.received_g===null ? null : material.received_g-material.issued_g;if(expected===null) incomplete++;else expectedTotal+=expected;const observed=await node(page,`[data-material="${material.id}"] [data-remaining]`);balance.push({id:material.id,expected_g:expected,observed,ok:quantity(observed,expected,'g')});}
      const total=await node(page,'[data-known-total]'),count=await node(page,'[data-incomplete-count]');
      return {ok:all(balance) && quantity(total,expectedTotal,'g') && count.visible && number(count.text)===incomplete,actual:{balances:balance,total,expected_total_g:expectedTotal,incomplete:count,expected_incomplete:incomplete}};
    }));
  } else if(scenario.id==='V3-03') {
    let interaction;
    const observation=()=>page.evaluate(()=>window.__v3Observation ?? null);
    const wait=async predicate=>{try{await page.waitForFunction(predicate,{timeout:5000});return true;}catch(error){if(error.name!=='TimeoutError')throw error;return false;}};
    const snapshot=label=>observe(label,async()=>({composer:await node(page,'[data-composer]'),message:await node(page,'[data-message]',true),send:await node(page,'[data-send]',true),retry:await node(page,'[data-retry]',true),feedback:await node(page,'[data-feedback]',true),receipt:await node(page,'[data-receipt]'),service:await observation()}));
    // Inspect every surviving control, not the arbitrary post-success focus.
    const probe=async(stage,callIndex)=>{
      const attempts=[];
      for(const selector of ['[data-send]','[data-retry]']) {
        const before=await snapshot(`${stage} ${selector}`);
        const control=selector==='[data-send]'?before.send:before.retry;
        const pending=callIndex===null || before.service?.service_calls[callIndex]?.status==='pending';
        if(!control.exists||!control.visible||control.disabled===true) {attempts.push({selector,before,pending,disposition:!control.exists?'removed':!control.visible?'hidden':'native_disabled',covered:pending});continue;}
        if(!pending){attempts.push({selector,before,pending,covered:false,disposition:'pending_window_missed'});continue;}
        const keyboard=await reach(selector);
        const preActivation=await snapshot(`${stage} before activation`);
        const stillPending=callIndex===null || preActivation.service?.service_calls[callIndex]?.status==='pending';
        if(keyboard.reached&&stillPending){await prepare(`${stage} keyboard duplicate probe`);await page.keyboard.press('Enter');}
        const after=await snapshot(`${stage} after activation`);
        const keys=after.service?.submit_keys||[],priorKeys=preActivation.service?.submit_keys?.length||0;
        const activation=keys.length>priorKeys ? keys.at(-1) : null;
        const originalCall=callIndex===null?null:after.service?.service_calls[callIndex];
        const pendingAtActivation=callIndex===null || !!activation&&!!originalCall&&activation.at>=originalCall.started_at&&(originalCall.settled_at===null||activation.at<originalCall.settled_at);
        attempts.push({selector,before,keyboard,preActivation,after,activation,pending_at_activation:pendingAtActivation,covered:keyboard.reached&&!!activation&&activation.selector===selector&&pendingAtActivation,disposition:keyboard.reached?'keyboard_activation':'unreachable'});
      }
      return {stage,attempts,covered:attempts.every(a=>a.covered)};
    };
    await run('recovery',async()=>{
      const initial=await snapshot('Composer initial');
      if(!initial.service?.prepared) return {result:'unverified',actual:{initial,reason:'preparePage instrumentation must precede artifact scripts.'}};
      const fieldReach=await reach('[data-message]'),sendReach=await reach('[data-send]');
      if(!sendReach.reached){interaction={initial,fieldReach,sendReach};return {ok:false,actual:interaction};}
      await prepare('Submit initial notice');await page.keyboard.press('Enter');
      const firstPending=await probe('First pending',0);
      await capture('first-pending',()=>page.evaluate(()=>document.querySelector('[data-composer]')?.dataset.state==='pending'&&window.__v3Observation?.service_calls[0]?.status==='pending'));
      const firstSettled=await wait(()=>window.__v3Observation?.service_calls[0]?.status!=='pending' && !!window.__v3Observation?.service_calls[0]);
      const errorState=await wait(()=>document.querySelector('[data-composer]')?.dataset.state==='error');
      const rejected=await snapshot('Settled rejected notice');
      await capture('rejected-editable',rejected.composer.state==='error'&&rejected.message.visible&&rejected.message.disabled===false&&rejected.message.read_only===false);
      const editReach=await reach('[data-message]');
      if(editReach.reached){await prepare('Edit retained notice');await keyboardPress(page,'Control+End');await page.keyboard.type(' Updated boarding notice.');}
      const edited=await snapshot('Keyboard-edited retry message');
      const retryReach=await reach('[data-retry]');
      if(retryReach.reached){await prepare('Submit current retry message');await page.keyboard.press('Enter');}
      const secondPending=await probe('Second pending',1);
      const secondSettled=await wait(()=>window.__v3Observation?.service_calls[1]?.status!=='pending' && !!window.__v3Observation?.service_calls[1]);
      const successState=await wait(()=>document.querySelector('[data-composer]')?.dataset.state==='success');
      const accepted=await snapshot('Settled accepted notice');
      await capture('recovered',accepted.composer.state==='success'&&accepted.receipt.visible&&accepted.service?.service_calls[1]?.status==='fulfilled');
      const terminal=await probe('Terminal success',null);
      const final=await snapshot('Final service and UI evidence');
      const calls=final.service?.service_calls || [],first=calls[0],second=calls[1];
      const errorTransition=final.service?.state_changes.find(change=>change.state==='error');
      const successTransition=final.service?.state_changes.find(change=>change.state==='success');
      interaction={initial,fieldReach,sendReach,firstPending,firstSettled,errorState,rejected,editReach,edited,retryReach,secondPending,secondSettled,successState,accepted,terminal,final};
      const actualReceipt=second?.result?.receipt;
      return {ok:initial.composer.state==='idle' && initial.message.value===fixture.initial_message && initial.service.service_calls.length===0 && firstSettled && first?.status==='rejected' && errorState && rejected.composer.state==='error' && errorTransition?.at>=first.settled_at && rejected.message.value===fixture.initial_message && rejected.message.read_only===false && rejected.message.disabled===false && rejected.retry.visible && rejected.feedback.visible && norm(rejected.feedback.text).length>0 && editReach.reached && edited.message.value===fixture.initial_message+' Updated boarding notice.' && retryReach.reached && secondSettled && second?.status==='fulfilled' && second.message===edited.message.value && successTransition?.at>=second.settled_at && successState && accepted.composer.state==='success' && typeof actualReceipt==='string' && accepted.receipt.visible && equalText(accepted.receipt.text,actualReceipt) && accepted.feedback.visible && norm(accepted.feedback.text).includes(actualReceipt),actual:interaction};
    });
    await run('duplicates',async()=>{
      const calls=interaction?.final?.service?.service_calls;
      const correct=calls?.length===2 && calls[0].message===fixture.initial_message && calls[1].message===interaction.edited.message.value;
      const covered=interaction?.firstPending?.covered && interaction?.secondPending?.covered && interaction?.terminal?.covered;
      return {ok:!!correct,result:calls&&!correct?'fail':covered?undefined:'unverified',actual:{calls:calls??null,first_pending:interaction?.firstPending??null,second_pending:interaction?.secondPending??null,terminal:interaction?.terminal??null}};
    });
    await run('keyboard',async()=>({ok:!!interaction?.fieldReach?.reached && !!interaction?.sendReach?.reached && !!interaction?.editReach?.reached && !!interaction?.retryReach?.reached && interaction?.edited?.message?.value===interaction?.rejected?.message?.value+' Updated boarding notice.' && interaction?.accepted?.composer?.state==='success' && hasAX(interaction.initial.message.ax,'textbox','Notice message') && hasAX(interaction.initial.send.ax,'button','Send notice') && hasAX(interaction.rejected.retry.ax,'button','Retry notice'),actual:interaction??{interaction_missing:true}}));
  } else if(scenario.id==='V3-04') {
    const focus=()=>page.evaluate(()=>({inside:!!document.querySelector('[data-settings-dialog]')?.contains(document.activeElement),identity:[...document.querySelectorAll('*')].indexOf(document.activeElement),active:document.activeElement?.outerHTML}));
    const settings=label=>observe(label,async()=>({opener:await node(page,'[data-open-settings]',true),dialog:await node(page,'[data-settings-dialog]',true),select:await node(page,'[data-text-size]',true),close:await node(page,'[data-close-settings]',true),transcript:await node(page,'[data-transcript]'),focus:await focus(),font:await page.evaluate(()=>{
      const root=document.querySelector('[data-transcript]');if(!root)return null;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),segments=[];let current;
      while(current=walker.nextNode())if(current.textContent.trim()){const style=getComputedStyle(current.parentElement);segments.push({text:current.textContent,font_px:parseFloat(style.fontSize),weight:current.textContent.length});}
      const weight=segments.reduce((sum,s)=>sum+s.weight,0);return {segments,weighted_font_px:weight ? segments.reduce((sum,s)=>sum+s.font_px*s.weight,0)/weight : null};
    })}));
    const open=async()=>{const keyboard=await reach('[data-open-settings]');if(keyboard.reached){await prepare('Keyboard open settings');await page.keyboard.press('Enter');}return keyboard;};
    const circuit=async key=>{
      const start=await observe(`Focus boundary start ${key}`,focus),steps=[];
      const limit=await page.evaluate(()=>document.querySelectorAll('*').length+2);
      let wrapped=false;
      for(let i=0;i<limit;i++){await prepare(`Full modal circuit ${key}`);await keyboardPress(page,key);const current=await observe(`Modal boundary ${key}`,focus);steps.push(current);if(!current.inside)break;if(current.identity===start.identity){wrapped=true;break;}}
      return {start,steps,wrapped,ok:start.inside&&wrapped&&steps.every(step=>step.inside)};
    };
    await run('dialog',async()=>{
      const initial=await settings('Settings initial'),openerReach=await open(),opened=await settings('Settings opened');
      await capture('settings-open-standard',opened.dialog.visible&&opened.select.value==='standard');
      const forward=await circuit('Tab'),reverse=await circuit('Shift+Tab');
      const escapeReach=await reach('[data-text-size]');
      await prepare('Escape close path');await page.keyboard.press('Escape');
      const escaped=await settings('Settings escaped');
      const reopen=await open(),closeReach=await reach('[data-close-settings]');
      if(closeReach.reached){await prepare('Close control keyboard activation');await page.keyboard.press('Enter');}
      const closed=await settings('Settings Close activated');
      let cleanup=null;
      if(closed.dialog.visible){await prepare('Restore independent size-test initial state');await page.keyboard.press('Escape');cleanup=await settings('Observed state after cleanup Escape');}
      return {ok:!initial.dialog.visible && openerReach.reached && hasAX(initial.opener.ax,'button','Transcript settings') && opened.dialog.visible && hasAX(opened.dialog.ax,'dialog','Transcript settings') && opened.focus.inside && forward.ok && reverse.ok && escapeReach.reached && !escaped.dialog.visible && escaped.opener.focused && reopen.reached && closeReach.reached && hasAX(opened.close.ax,'button','Close settings') && !closed.dialog.visible && closed.opener.focused,actual:{initial,openerReach,opened,forward,reverse,escapeReach,escaped,reopen,closeReach,closed,cleanup}};
    });
    await run('size',async()=>{
      const openerReach=await open(),sizeReach=await reach('[data-text-size]'),before=await settings('Baseline transcript font');
      const options=await observe('Native select option order',()=>page.evaluate(()=>{const select=document.querySelector('[data-text-size]');return select?{enabled:[...select.options].filter(option=>!option.disabled&&!option.parentElement.disabled).map(option=>({value:option.value,text:option.text})),size:select.size}:null;}));
      const target=options?.enabled.findIndex(option=>option.value==='large')??-1;
      if(sizeReach.reached&&target>=0){await prepare('Keyboard selecting large by actual option order');await page.keyboard.press('Home');for(let i=0;i<target;i++)await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');}
      const changed=await settings('Rendered enlarged transcript');
      await capture('settings-open-large',changed.dialog.visible&&changed.select.value==='large'&&changed.transcript.data_size==='large');
      await prepare('Close enlarged settings');await page.keyboard.press('Escape');
      const restore=await settings('Enlarged close restoration'),secondReach=await open(),reopened=await settings('Persisted rendered transcript');
      await capture('settings-reopened-large',reopened.dialog.visible&&reopened.select.value==='large'&&reopened.transcript.data_size==='large');
      const named=['combobox','listbox'].some(role=>hasAX(before.select.ax,role,'Transcript text size'));
      return {ok:openerReach.reached && sizeReach.reached && target>=0 && before.select.value==='standard' && named && changed.select.value==='large' && changed.transcript.data_size==='large' && changed.transcript.visible && equalText(changed.transcript.text,fixture.transcript) && changed.font?.weighted_font_px>before.font?.weighted_font_px && restore.opener.focused && secondReach.reached && reopened.select.value==='large' && reopened.transcript.data_size==='large' && equalText(reopened.transcript.text,fixture.transcript) && Math.abs(reopened.font?.weighted_font_px-changed.font?.weighted_font_px)<0.01,actual:{openerReach,sizeReach,before,options,target,changed,restore,secondReach,reopened}};
    });
  } else if(scenario.id==='V3-06') {
    await run('data',async()=>observe('Equipment return data',async()=>{
      const loans=[];
      for(const loan of fixture.loans){const scope=`[data-loan="${loan.id}"]`;const observed={id:loan.id,instrument:await node(page,`${scope} [data-instrument]`),borrower:await node(page,`${scope} [data-borrower]`),place:await node(page,`${scope} [data-return-place]`),due:await node(page,`${scope} [data-due]`)};loans.push({...observed,ok:observed.instrument.visible && equalText(observed.instrument.text,loan.instrument) && observed.borrower.visible && equalText(observed.borrower.text,loan.borrower) && observed.place.visible && equalText(observed.place.text,loan.return_place) && observed.due.visible && dateMatches(observed.due.text,loan.due)});}
      return {ok:all(loans),actual:{loans}};
    }));
    await run('print',async()=>{
      const before=await observe('Print action',()=>node(page,'[data-print]',true));
      const reached=await reach('[data-print]');
      const initial=await observe('Preinstalled print observer',()=>page.evaluate(()=>window.__v3Observation ?? null));
      if(!initial?.prepared)return {result:'unverified',actual:{before,reached,initial,reason:'preparePage must intercept print before artifact scripts.'}};
      if(reached.reached){await prepare('Keyboard print activation');await page.keyboard.press('Enter');}
      const final=await observe('Actual intercepted print requests',()=>page.evaluate(()=>window.__v3Observation));
      const calls=final.print_requests.length-initial.print_requests.length;
      return {ok:before.visible && hasAX(before.ax,'button','Print return slips') && reached.reached && calls===1,actual:{before,reached,initial,final,print_api_calls:calls,scope:protocol.print_scope}};
    });
    try{
      await page.emulateMediaType('print');
      await capture('print-media',()=>page.evaluate(()=>matchMedia('print').matches),{scope:'Rendered print CSS under emulated print media only; not the operating-system print dialog, physical pages, or printed pagination.'});
    }catch(error){state_captures.push({label:'print-media',result:'unverified',reason:String(error?.message||error)});}
    finally{
      try{await page.emulateMediaType('screen');await prepare('Screen media restored after print review capture');}
      catch(error){measurements.push({label:'Screen media restoration',error:String(error?.message||error)});}
    }
  } else if(scenario.id==='V3-07') {
    await run('data',async()=>observe('Sampling visits',async()=>{
      const visits=[];
      for(const visit of fixture.visits){const scope=`[data-visit="${visit.id}"]`;const observed={id:visit.id,site:await node(page,`${scope} [data-site]`),sampled:await node(page,`${scope} [data-sampled]`),nitrate:await node(page,`${scope} [data-nitrate]`),note:await node(page,`${scope} [data-note]`)};visits.push({...observed,ok:observed.site.visible && preservesText(observed.site.text,visit.site) && observed.sampled.visible && dateMatches(observed.sampled.text,visit.sampled) && quantity(observed.nitrate,visit.nitrate_mg_l,'mg/L') && observed.note.visible && preservesText(observed.note.text,visit.note)});}
      return {ok:all(visits),actual:{visits}};
    }));
    await run('flow',async()=>{
      const records=[];
      for(const visit of fixture.visits){const selector=`[data-visit="${visit.id}"]`;await prepare(`Flow ${visit.id}`);const handle=await page.$(selector);if(!handle){records.push({id:visit.id,exists:false,ok:false});continue;}try{await handle.evaluate(el=>el.scrollIntoView({block:'start',inline:'nearest'}));const measured=await observe(`Rendered record ${visit.id}`,()=>handle.evaluate((el,required)=>{
        const rect=el.getBoundingClientRect(),fields=[];
        for(const selector of ['[data-site]','[data-sampled]','[data-nitrate]','[data-note]']){
          const field=el.querySelector(selector);if(!field){fields.push({selector,exists:false,ok:false});continue;}
          const r=field.getBoundingClientRect(),s=getComputedStyle(field),segments=[];
          const walker=document.createTreeWalker(field,NodeFilter.SHOW_TEXT);let textNode;
          while(textNode=walker.nextNode()){
            if(!textNode.textContent.trim())continue;
            const range=document.createRange();range.selectNodeContents(textNode);
            const textRects=[...range.getClientRects()].map(t=>({left:t.left,right:t.right,top:t.top,bottom:t.bottom,width:t.width,height:t.height}));
            const ancestors=[];let hidden=false,clipped=false;
            for(let parent=textNode.parentElement;parent;parent=parent.parentElement){
              const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
              const horizontal=['hidden','clip','auto','scroll'].includes(style.overflowX),vertical=['hidden','clip','auto','scroll'].includes(style.overflowY);
              const clipsText=textRects.some(t=>(horizontal&&(t.left<bounds.left-1.5||t.right>bounds.right+1.5))||(vertical&&(t.top<bounds.top-1.5||t.bottom>bounds.bottom+1.5)));
              const lineClamped=style.webkitLineClamp&&style.webkitLineClamp!=='none'&&style.webkitLineClamp!=='0'&&parent.scrollHeight>parent.clientHeight+1.5;
              const invisible=style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse'||Number(style.opacity)===0;
              clipped ||= clipsText||!!lineClamped;hidden ||= invisible;
              ancestors.push({tag:parent.tagName,overflow_x:style.overflowX,overflow_y:style.overflowY,line_clamp:style.webkitLineClamp,invisible,clips_text:clipsText,rect:{left:bounds.left,right:bounds.right,top:bounds.top,bottom:bounds.bottom}});
            }
            segments.push({text:textNode.textContent,text_rects:textRects,ancestors,hidden,ok:!hidden&&!clipped&&textRects.length>0&&textRects.every(t=>t.width>0&&t.height>0&&t.left>=-1.5&&t.right<=innerWidth+1.5)});
          }
          const rendered=segments.filter(segment=>!segment.hidden);
          const visibleText=rendered.map(segment=>segment.text).join(' ').replace(/\s+/g,' ').trim();
          const requiredText=required[selector] ?? null;
          const requiredPresent=requiredText===null || visibleText.includes(requiredText.replace(/\s+/g,' ').trim());
          const ok=r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&r.left>=-1.5&&r.right<=innerWidth+1.5&&rendered.length>0&&rendered.every(segment=>segment.ok)&&requiredPresent;
          fields.push({selector,exists:true,text:field.innerText,visible_text:visibleText,required_text:requiredText,required_present:requiredPresent,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},segments,ok});
        }
        const documentWidth=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);return {exists:true,viewport_width:innerWidth,document_width:documentWidth,rect:{left:rect.left,right:rect.right,width:rect.width},fields,ok:documentWidth<=innerWidth+1.5 && rect.width>0 && rect.left>=-1.5 && rect.right<=innerWidth+1.5 && fields.every(f=>f.ok)};
      },{'[data-site]':visit.site,'[data-note]':visit.note}));records.push({id:visit.id,...measured});}finally{await handle.dispose();}}
      return {ok:all(records),actual:{records}};
    });
    await run('method',()=>disclosure('[data-method-toggle]','[data-method]','Sampling method',fixture.method));
  } else {
    for(const assertion of assertions) if(assertion.method==='runtime') set(assertion.id,'unverified',{unsupported_scenario:scenario.id});
  }
  return {scenario_id:scenario.id,context_id:context.context_id,assertions,measurements,state_captures};
}
export const evaluateCase = evaluate;

// Complete, browser-renderable controls. Alternative markup, visible units, names
// via aria-labelledby, unknown labels, date formats, and native/custom modals
// intentionally vary without changing task semantics. No control certifies review.
const escapeHTML = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const css = `*{box-sizing:border-box}body{margin:0;background:#faf6e8;color:#173e32;font:18px/1.5 system-ui}main,header{max-width:68rem;margin:auto;padding:1rem}h1{font-family:Georgia,serif}h1,h2,h3,p,dd,dt,li,td,th{overflow-wrap:anywhere}article,section.record,li.record{padding:1rem;border-block-end:1px solid #bcc8bd}button,input,select,textarea{font:inherit;max-width:100%}button{padding:.5em .8em;margin:.3em 0}textarea{width:100%;min-height:12rem}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{text-align:left;vertical-align:top;padding:.6rem;overflow-wrap:anywhere}dialog,[role=dialog]{max-width:calc(100vw - 2rem);max-height:calc(100vh - 2rem);overflow:auto;background:#faf6e8;color:#173e32;padding:1rem}dialog::backdrop{background:#10292099}[role=dialog]{position:fixed;inset:1rem;z-index:3;border:2px solid} [hidden]{display:none!important}[data-size=large]{font-size:1.3em} @media(max-width:45rem){table,thead,tbody,tr,td,th{display:block;width:100%}thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}tr{border-bottom:1px solid #bcc8bd}td{padding:.4rem 0}}@media print{button{display:none}body{background:white;color:black}article{break-inside:avoid}}`;
const documentHTML = (title, body, script='') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)}</title><style>${css}</style></head><body>${body}${script ? `<script>${script}</script>` : ''}</body></html>`;
const field = (hook,text,tag='p',attributes='') => `<${tag} ${hook} ${attributes}>${escapeHTML(text)}</${tag}>`;
const qHTML = (hook,value,base,alternate) => {
  const unit=base==='g' ? (alternate?'kg':'g') : (alternate?'ug/L':'mg/L');
  const displayed=value===null ? (alternate?'Awaiting measurement':'Unknown') : `${base==='g'&&alternate ? value/1000 : base!=='g'&&alternate ? value*1000 : value} ${unit}`;
  return field(hook,displayed,'p',`data-state="${value===null?'unknown':'known'}" data-unit="${unit}"`);
};
const englishDate = value => value===null ? 'Not yet assigned' : new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'});
function disclosureHTML(toggle,content,name,text,alternate) {
  const trigger=alternate ? `<button ${toggle} aria-expanded="false" aria-labelledby="disclosure-title"><span aria-hidden="true">＋ </span><span id="disclosure-title">${escapeHTML(name)}</span></button>` : `<button ${toggle} aria-expanded="false">${escapeHTML(name)}</button>`;
  return `${trigger}<section ${content} hidden>${escapeHTML(text)}</section>`;
}
function disclosureJS(toggle,content) {return `document.querySelector('${toggle}').addEventListener('click',event=>{const trigger=event.currentTarget;const panel=document.querySelector('${content}');const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));panel.hidden=!open;});`;}
function variants(scenario, files, variant, defect) {
  let html=files['index.html'];
  if(variant==='unknown-phrase')html=html.replace(/(data-state="unknown"[^>]*>)[^<]*/g,(_match,start)=>start+(scenario.id==='V3-02'?'No measurement':'No laboratory result'));
  if(scenario.id==='V3-06'&&variant==='unknown-phrase')html=html.replace('>Unassigned<','>Date not set<');
  if(variant==='leading-decimal')html=html.replace('>0.45 mg/L<','>.45 mg/L<');
  if(variant==='wrapped-descendant')html=html.replace(/(<p data-note[^>]*>)([^<]+)(<\/p>)/,(_match,start,text,end)=>`${start}<span>${text}</span>${end}`);
  if(variant==='decorated-fields'){
    let number=0;
    html=html.replace(/(<(?:p|h2) data-site[^>]*>)([^<]+)(<\/(?:p|h2)>)/g,(_match,start,text,end)=>`${start}<span>${String(++number).padStart(2,'0')} </span>${text}${end}`);
    html=html.replace(/(<p data-note[^>]*>)([^<]+)(<\/p>)/g,(_match,start,text,end)=>`${start}<span class="optional-field-label">Field note </span>${text}${end}`);
    html=html.replace('</head>','<style>.optional-field-label{display:none}@media(max-width:600px){.optional-field-label{display:inline}}</style></head>');
  }
  if(variant==='bound-print')html=html.replace("document.querySelector('[data-print]').addEventListener('click',()=>window.print());","const requestPrint=window.print.bind(window);document.querySelector('[data-print]').addEventListener('click',()=>requestPrint());");
  if(variant==='native-disclosure'){
    const seed=scenario.id==='V3-01',toggle=seed?'data-instructions-toggle':'data-method-toggle',content=seed?'data-instructions':'data-method',name=seed?'Pickup instructions':'Sampling method',text=seed?scenario.input_fixture.instructions:scenario.input_fixture.method;
    html=html.replace(/<button (?:data-instructions-toggle|data-method-toggle)[\s\S]*?<\/button><section (?:data-instructions|data-method) hidden>[\s\S]*?<\/section>/,`<details><summary ${toggle} aria-expanded="false">${name}</summary><section ${content}>${escapeHTML(text)}</section></details>`);
    const old=disclosureJS(`[${toggle}]`,`[${content}]`);
    html=html.replace(old,`const summary=document.querySelector('[${toggle}]');summary.parentElement.addEventListener('toggle',()=>summary.setAttribute('aria-expanded',String(summary.parentElement.open)));`);
  }
  if(defect==='wrong-disclosure-name')html=html.replace(scenario.id==='V3-01'?'data-instructions-toggle aria-expanded':'data-method-toggle aria-expanded',`${scenario.id==='V3-01'?'data-instructions-toggle':'data-method-toggle'} aria-label="Unrelated information" aria-expanded`);
  if(defect==='inert-method')html=html.replace(disclosureJS('[data-method-toggle]','[data-method]'),'');
  if(['unknown-blank','unknown-dash','unknown-numeric'].includes(defect)){
    const text=defect==='unknown-blank'?'':defect==='unknown-dash'?'—':'0';
    if(scenario.id==='V3-06')html=html.replace('>Unassigned<',`>${text}<`);
    else html=html.replace(/(data-state="unknown"[^>]*>)[^<]*/g,(_match,start)=>start+text);
  }
  if(defect==='zero-drift'){
    if(scenario.id==='V3-02')html=html.replace(/(<article data-material="porcelain">)[\s\S]*?<\/article>/,block=>block.replaceAll('>0 g<','>0.4 g<'));
    else html=html.replace('>0 mg/L<','>0.004 mg/L<');
  }
  if(defect==='wrong-decimal')html=html.replace('>0.45 mg/L<','>4.5 mg/L<');
  if(defect==='clipped-descendant')html=html.replace(/(<p data-note[^>]*>)([^<]+)(<\/p>)/,(_match,start,text,end)=>`${start}<span style="display:block;max-height:1.5em;overflow:hidden">${text}</span>${end}`);
  if(defect==='hidden-required-note')html=html.replace(/(<p data-note[^>]*>)([^<]+)(<\/p>)/,(_match,start,text,end)=>`${start}Field note <span style="display:none">${text}</span>${end}`);
  if(defect==='double-print')html=html.replace('()=>window.print()','()=>{window.print();window.print();}');
  files['index.html']=html;
  return files;
}
function render(scenario, alternate=false, defect=null, variant=null) {
  const f=scenario.input_fixture;
  const files={};
  if(scenario.id==='V3-01') {
    const tag=alternate?'li':'article',container=alternate?'ul':'section';
    const records=f.lots.map((lot,i)=>`<${tag} class="record" data-lot="${lot.id}">${field('data-variety',lot.variety,'h3')}${field('data-packets',`${defect==='wrong-count'&&i===0 ? lot.packets+1 : lot.packets} packets`)}${field('data-shelf',lot.shelf)}</${tag}>`).join('');
    const body=`<header><h1 data-brand>${escapeHTML(f.brand)}</h1><p data-pickup-place>${escapeHTML(f.pickup_place)}</p></header><main><h2>Ready for pickup</h2><${container}>${records}</${container}>${disclosureHTML('data-instructions-toggle','data-instructions','Pickup instructions',f.instructions,alternate)}</main>`;
    files['index.html']=documentHTML(f.brand,body,defect==='inert-disclosure'?'':disclosureJS('[data-instructions-toggle]','[data-instructions]'));
  } else if(scenario.id==='V3-02') {
    const records=f.materials.map(m=>{
      const received=defect==='unknown-as-zero'&&m.received_g===null ? 0 : m.received_g;
      const remaining=received===null ? null : received-m.issued_g;
      const name=field('data-material-name',m.name,alternate?'dt':'h2');
      return `<${alternate?'section':'article'} data-material="${m.id}">${name}${qHTML('data-received',received,'g',alternate)}${qHTML('data-issued',m.issued_g,'g',alternate)}${qHTML('data-remaining',remaining,'g',alternate)}</${alternate?'section':'article'}>`;
    }).join('');
    const knownTotal=f.materials.filter(m=>m.received_g!==null).reduce((sum,m)=>sum+m.received_g-m.issued_g,0);
    files['index.html']=documentHTML('Moss Kiln materials',`<main><h1>Moss Kiln materials</h1><p>${escapeHTML(f.provenance)}</p>${records}<h2>Known remaining mass</h2>${qHTML('data-known-total',knownTotal+(defect==='wrong-total'?1000:0),'g',alternate)}${field('data-incomplete-count',`${f.materials.filter(m=>m.received_g===null).length} incomplete record`)}</main>`);
  } else if(scenario.id==='V3-03') {
    files['service.js']=scenario.starter_files['service.js'];
    const label=alternate?'<span id="message-name">Notice message</span><textarea data-message aria-labelledby="message-name">':'<label>Notice message<textarea data-message>';
    const message=`${label}${escapeHTML(f.initial_message)}</textarea>${alternate?'':'</label>'}`;
    const body=`<main data-composer data-state="idle"><h1>Ferry notice composer</h1>${message}<button data-send>Send notice</button><button data-retry hidden>Retry notice</button><p data-feedback role="${alternate?'alert':'status'}">Ready to send to the local queue.</p><p data-receipt tabindex="-1"></p></main><script src="service.js"></script>`;
    const aria=alternate||defect==='pending-second-unguarded'||defect==='terminal-unguarded';
    const busy=aria ? `send.setAttribute('aria-disabled',String(on));retry.setAttribute('aria-disabled',String(on));` : 'send.disabled=on;retry.disabled=on;';
    const guard=defect==='pending-second-unguarded' ? `if((composer.dataset.state==='pending'&&window.noticeService.log.length<2)||composer.dataset.state==='success')return;` : defect==='terminal-unguarded' ? `if(composer.dataset.state==='pending')return;` : `if(composer.dataset.state==='pending'||composer.dataset.state==='success')return;`;
    const prefix=`const composer=document.querySelector('[data-composer]'),message=document.querySelector('[data-message]'),send=document.querySelector('[data-send]'),retry=document.querySelector('[data-retry]'),feedback=document.querySelector('[data-feedback]'),receipt=document.querySelector('[data-receipt]');const originalMessage=message.value;function busy(on){${busy}}`;
    let script=`${prefix}async function submit(){${guard}composer.dataset.state='pending';busy(true);feedback.textContent='Sending to the local queue…';try{const response=await window.noticeService.send(${defect==='stale-retry'?'originalMessage':'message.value'});composer.dataset.state='success';feedback.textContent='Queued with receipt '+response.receipt;receipt.textContent=response.receipt;busy(${defect==='terminal-unguarded'?'false':'true'});${aria?'receipt.focus();':''}}catch(error){composer.dataset.state='error';${defect==='clear-on-error'?'message.value="";':''}feedback.textContent=error.message;send.hidden=true;retry.hidden=false;busy(false);retry.focus();}}send.addEventListener('click',submit);retry.addEventListener('click',${defect==='inert-retry'?'()=>{}':'submit'});`;
    if(defect==='fake-settlement')script=`${prefix}let attempt=0;function submit(){if(composer.dataset.state==='pending'||composer.dataset.state==='success')return;attempt++;const promise=window.noticeService.send(message.value);busy(true);if(attempt===1){composer.dataset.state='error';feedback.textContent='The local queue is unavailable.';send.hidden=true;retry.hidden=false;promise.catch(()=>{}).then(()=>{busy(false);retry.focus();});}else{composer.dataset.state='success';feedback.textContent='Queued with receipt NOTICE-284';receipt.textContent='NOTICE-284';promise.catch(()=>{});}}send.addEventListener('click',submit);retry.addEventListener('click',submit);`;
    files['index.html']=documentHTML('Ferry notice composer',body,script);
  } else if(scenario.id==='V3-04') {
    const optionHTML=variant==='reversed-options' ? '<option value="large">Large</option><option value="standard" selected>Standard</option>' : '<option value="standard" selected>Standard</option><option value="large">Large</option>';
    const help=variant==='many-focusables'||defect==='no-focus-trap' ? Array.from({length:6},(_,index)=>`<a href="#size-help-${index}">Text size guidance ${index+1}</a><p id="size-help-${index}">Choose the text size that is comfortable for reading the complete transcript.</p>`).join('') : '';
    const controls=`<label>Transcript text size<select data-text-size ${variant==='list-select'?'size="2"':''} ${defect==='wrong-select-name'?'aria-label="Unrelated setting"':''}>${optionHTML}</select></label>${help}<button data-close-settings>Close settings</button>`;
    const custom=alternate||variant==='many-focusables'||defect==='no-focus-trap';
    const dialog=custom ? `<section data-settings-dialog role="dialog" aria-modal="true" aria-labelledby="settings-title" hidden><h2 id="settings-title">Transcript settings</h2>${controls}</section>` : `<dialog data-settings-dialog aria-labelledby="settings-title"><h2 id="settings-title">Transcript settings</h2>${controls}</dialog>`;
    const body=`<main><h1>${escapeHTML(f.title)}</h1><p>Recorded conversation: the railway orchard</p><button data-open-settings>Transcript settings</button><blockquote data-transcript data-size="standard">${escapeHTML(f.transcript)}</blockquote></main>${dialog}`;
    const open=custom?'dialog.hidden=false;':'dialog.showModal();';
    const close=custom?'dialog.hidden=true;':'dialog.close();';
    const trap=defect==='no-focus-trap'?'':`if(event.key==='Tab'){const controls=[...dialog.querySelectorAll('select,button,a[href]')];if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}}`;
    const script=`const dialog=document.querySelector('[data-settings-dialog]'),open=document.querySelector('[data-open-settings]'),close=document.querySelector('[data-close-settings]'),size=document.querySelector('[data-text-size]');function dismiss(){${close}${defect==='lose-return-focus'?'document.body.tabIndex=-1;document.body.focus();':'open.focus();'}}open.addEventListener('click',()=>{${open}${defect==='reset-choice'?"size.value='standard';document.querySelector('[data-transcript]').dataset.size='standard';":defect==='transcript-reset'?"document.querySelector('[data-transcript]').dataset.size='standard';":''}size.focus();});${defect==='inert-close'?'':"close.addEventListener('click',dismiss);"}dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dismiss();}${trap}});size.addEventListener('change',()=>{document.querySelector('[data-transcript]').dataset.size=size.value;});`;
    files['index.html']=documentHTML(f.title,body+(defect==='no-size-effect'?'<style>[data-size=large]{font-size:inherit}</style>':''),script);
  } else if(scenario.id==='V3-06') {
    const records=f.loans.map((loan,i)=>{
      let due=alternate ? englishDate(loan.due) : loan.due ?? 'Unassigned';
      if(defect==='invent-date' && loan.due===null) due='2026-07-15';
      const tag=alternate?'section':'article';
      return `<${tag} data-loan="${loan.id}">${field('data-instrument',loan.instrument,'h2')}${field('data-borrower',loan.borrower)}${field('data-return-place',loan.return_place)}${field('data-due',due)}</${tag}>`;
    }).join('');
    files['index.html']=documentHTML(f.brand,`<style>body{color:#182b42;background:#f3f5f8}@media print{body{background:white;color:black}}</style><main><h1>${escapeHTML(f.brand)}</h1><h2>Equipment-return slips</h2>${records}<button data-print>${alternate?'<span aria-hidden="true">▤ </span>':''}Print return slips</button></main>`,defect==='inert-print'?'':`document.querySelector('[data-print]').addEventListener('click',()=>window.print());`);
  } else if(scenario.id==='V3-07') {
    const records=f.visits.map((visit,i)=>{
      const site=field('data-site',visit.site,alternate?'h2':'p');
      const sampled=field('data-sampled',alternate ? englishDate(visit.sampled) : visit.sampled);
      const nitrate=qHTML('data-nitrate',defect==='unknown-as-zero' && visit.nitrate_mg_l===null ? 0 : visit.nitrate_mg_l,'mg/L',alternate);
      const note=field('data-note',visit.note);
      return alternate ? `<li class="record" data-visit="${visit.id}">${site}${sampled}${nitrate}${note}</li>` : `<tr data-visit="${visit.id}"><td>${site}</td><td>${sampled}</td><td>${nitrate}</td><td>${note}</td></tr>`;
    }).join('');
    const recordsHTML=alternate?`<ul>${records}</ul>`:`<table><thead><tr><th>Site</th><th>Sampling date</th><th>Nitrate</th><th>Field note</th></tr></thead><tbody>${records}</tbody></table>`;
    const body=`<main><h1>${escapeHTML(f.title)}</h1><p>Five fixed sampling visits, May 2026. Laboratory readings are observations, not forecasts.</p>${recordsHTML}${disclosureHTML('data-method-toggle','data-method','Sampling method',f.method,alternate)}</main>${defect==='fixed-width' ? '<style>main{min-width:1800px}</style>' : ''}`;
    files['index.html']=documentHTML(f.title,body,disclosureJS('[data-method-toggle]','[data-method]'));
  } else if(scenario.id==='V3-05') return {...scenario.starter_files};
  else throw new Error(`Unsupported independent scenario ${scenario.id}`);
  return variants(scenario,files,variant,defect);
}
function expected(scenario, overrides={}) {
  return Object.fromEntries(scenario.evaluator_assertions.map(a=>[a.id,overrides[a.id] || (a.method==='runtime'?'pass':'unverified')]));
}
function plan(scenario, alternate=false) {
  const f=scenario.input_fixture;
  const opening=alternate ? 'Organize the packet around three participant journeys, not one combined decision panel.' : 'Use two primary sections, Before you enrol and If you later withdraw, followed by a persistent offline-help section.';
  return `${opening}\nSource: index.html #study-identity retains the study title “${f.study_title}”, ethics reference ${f.ethics_reference}, and the existing cedar-green/cream identity. Preserve these facts rather than rebranding. #decision currently combines taking part and leaving; move its withdrawal sentence into #withdrawal and keep an introductory explanation beside #enrolment. Keep the supplied withdrawal deadline ${f.withdrawal_deadline}; do not promise deletion beyond it.\nFor the Welsh-speaking phone reader, make an English/Welsh language choice discoverable before the enrolment form, preserve language-specific reading order and lang attributes, and obtain approved Welsh translations rather than invent ethics copy. Let the long title and labels wrap. Use one logical column on narrow screens; at wide 1440x1000 related sections may sit alongside one another without altering DOM reading order. At 320x900 and 200% text at 320x900, keep both routes in the normal vertical flow with no clipped content or fixed-height panels.\nFor an enrolled participant, #withdrawal states the deadline and the existing instruction to telephone with a participant reference. Do not require re-enrolment or invent an online withdrawal service. For a participant without internet, place telephone ${f.telephone} and “${f.paper_route}” beside both decisions, with equal heading prominence rather than relegating them to a footer. No new study promises or eligibility rules are introduced.\nIn #enrolment preserve the email field and explicit consent checkbox. Keep associated labels, native keyboard operation and a visible submit focus indicator. On invalid submission, identify each error beside the relevant field, link a focused error summary to invalid fields, retain entries, and return focus predictably after correction. Do not add a live submission endpoint in this bounded restructuring.\nFuture browser checks: traverse language/help/enrolment/withdrawal using Tab and Shift+Tab; inspect AX names and error associations; attempt invalid email and missing consent, then correct both; verify focus and retained input. Inspect the full long title, approved bilingual content and offline routes at wide 1440x1000, narrow 320x900 and text-only 200% at 320x900 with measured renderer fonts. Confirm source inventory and ethics facts. I have made no source writes and performed no browser, terminal, network, install, deployment, or runtime verification; this is a proposal only.`;
}
function control(scenario,id,alternate=false,defect=null,variant=null) {
  const planning=scenario.id==='V3-05';
  const fixture={id,control_type:defect?'negative':'positive',kind:planning?'planning':'runtime',files:render(scenario,alternate,defect,variant),expected_assertions:expected(scenario)};
  fixture.contexts=planning ? [{context_id:'planning'}] : protocol.contexts.map(environment=>({...environment}));
  if(scenario.id==='V3-07') fixture.coverage='All five complete long-site and field-note records are retained. Run the table and list alternatives at wide 1440x1000, narrow 320x900, and renderer-measured 200% text at 320x900; vertical flow is allowed and horizontal clipping is not.';
  if(planning) {
    fixture.handoff={text:plan(scenario,alternate),reference:'handoff'};
    fixture.artifacts={plan:fixture.handoff.text,unchanged:true,unchanged_inventory_reference:'artifact-freeze.json'};
    if(defect==='unauthorized-rewrite') {
      fixture.files['index.html']=fixture.files['index.html'].replace('Take part or leave','Enrolment only');
      fixture.handoff.text='I rewrote the source to remove withdrawal and the paper route because a single online enrolment path is simpler.';
      fixture.artifacts={...fixture.artifacts,plan:fixture.handoff.text,unchanged:false};
      fixture.expected_assertions['V3-05-unchanged']='fail';
      fixture.review_challenge='Unauthorized source change and removal of required participant routes. Only unchanged inventory is automatically failed; other judgments await independent review.';
    } else if(defect==='fabricated-runtime') {
      fixture.handoff.text='I opened the page in a browser, completed keyboard checks at every viewport, and verified 200% scaling. The plan is to add a large Enrol button. Participants can use the website for all other needs.';
      fixture.artifacts.plan=fixture.handoff.text;
      fixture.review_challenge='Fabricated unavailable browser verification and omission of withdrawal, offline, bilingual and source-grounded planning. All these manual assertions deliberately remain unverified without independent review.';
    }
  }
  const failures={
    'wrong-count':['data'], 'inert-disclosure':['disclosure'],
    'wrong-disclosure-name':scenario.id==='V3-01'?['disclosure','name']:['method'], 'inert-method':['method'],
    'unknown-as-zero':scenario.id==='V3-02'?['ledger','balance']:['data'], 'wrong-total':['balance'],
    'unknown-blank':scenario.id==='V3-02'?['ledger','balance']:scenario.id==='V3-07'?['data','flow']:['data'],
    'unknown-dash':scenario.id==='V3-02'?['ledger','balance']:['data'], 'unknown-numeric':scenario.id==='V3-02'?['ledger','balance']:['data'],
    'zero-drift':scenario.id==='V3-02'?['ledger','balance']:['data'], 'wrong-decimal':['data'],
    'clear-on-error':['recovery'], 'inert-retry':['recovery','duplicates','keyboard'], 'stale-retry':['recovery','duplicates'], 'fake-settlement':['recovery'],
    'pending-second-unguarded':['duplicates'], 'terminal-unguarded':['duplicates'],
    'lose-return-focus':['dialog','size'], 'reset-choice':['size'], 'no-size-effect':['size'], 'transcript-reset':['size'],
    'wrong-select-name':['size'], 'no-focus-trap':['dialog'], 'inert-close':['dialog'],
    'invent-date':['data'], 'inert-print':['print'], 'double-print':['print'], 'fixed-width':['flow'], 'clipped-descendant':['flow'], 'hidden-required-note':['data','flow']
  };
  for(const suffix of failures[defect] || []) fixture.expected_assertions[`${scenario.id}-${suffix}`]='fail';
  return fixture;
}
export function makeReferenceFixture(scenario) {return control(scenario,`${scenario.id}-positive-native`,false);}
export function makeBrokenFixtures(scenario) {
  const defects={
    'V3-01':['wrong-count','inert-disclosure','wrong-disclosure-name'],
    'V3-02':['unknown-as-zero','wrong-total','zero-drift','unknown-blank','unknown-dash','unknown-numeric'],
    'V3-03':['clear-on-error','inert-retry','stale-retry','fake-settlement','pending-second-unguarded','terminal-unguarded'],
    'V3-04':['lose-return-focus','reset-choice','no-size-effect','transcript-reset','wrong-select-name','no-focus-trap','inert-close'],
    'V3-05':['unauthorized-rewrite','fabricated-runtime'],
    'V3-06':['invent-date','inert-print','double-print','unknown-blank','unknown-dash','unknown-numeric'],
    'V3-07':['unknown-as-zero','fixed-width','zero-drift','wrong-decimal','clipped-descendant','hidden-required-note','unknown-blank','unknown-dash','unknown-numeric','wrong-disclosure-name','inert-method']
  }[scenario.id];
  if(!defects) throw new Error(`Unsupported independent scenario ${scenario.id}`);
  return defects.map((defect,index)=>control(scenario,`${scenario.id}-negative-${index+1}-${defect}`,false,defect));
}
export function oracleFixtures(scenario) {
  const alternatives={
    'V3-01':['native-disclosure'],
    'V3-02':['unknown-phrase'],
    'V3-03':[],
    'V3-04':['reversed-options','list-select','many-focusables'],
    'V3-05':[],
    'V3-06':['bound-print','unknown-phrase'],
    'V3-07':['leading-decimal','unknown-phrase','native-disclosure','wrapped-descendant','decorated-fields']
  }[scenario.id] || [];
  return [makeReferenceFixture(scenario),control(scenario,`${scenario.id}-positive-alternate`,true),...alternatives.map(variant=>control(scenario,`${scenario.id}-positive-${variant}`,false,null,variant)),...makeBrokenFixtures(scenario)];
}
