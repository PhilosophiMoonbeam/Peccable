/* Repository-only custodian resource. Never load in a skill or trial prompt.
 * No dependencies/import side effects. Owner supplies a Puppeteer Page, already
 * loaded fresh at each declared viewport/text scale. No runtime executed here.
 * API documentation lookup was not run: this assignment forbids execution and
 * network. APIs used are basic Page.evaluate and Keyboard down/up/press/type.
 */
const RESULTS = new Set(['pass', 'fail', 'unverified', 'not_applicable']);
const norm = value => String(value ?? '').replace(/\u2212/g, '-').replace(/\s+/g, ' ').trim();
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
class ContractFailure extends Error {}
const evaluationContexts = new WeakMap();
async function applyTextScale(page) {
  const context = evaluationContexts.get(page);
  if (context?.text_scale === 2 && typeof context.ensureTextScale === 'function') {
    const measurement = await context.ensureTextScale();
    if (measurement?.verified === false) throw new Error('Harness could not apply text scaling to current content.');
  }
}

async function readControl(page, selector) {
  await applyTextScale(page);
  return page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const visible = node => {
      if (!node.getClientRects().length) return false;
      for (let n = node; n instanceof Element; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (n.hidden || s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse') return false;
      }
      return true;
    };
    const labelled = el.getAttribute('aria-labelledby');
    const name = labelled ? labelled.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ') :
      el.getAttribute('aria-label') || (el.labels?.length ? Array.from(el.labels).map(l => l.innerText).join(' ') : el.innerText || el.getAttribute('title') || '');
    return {text: el.innerText || '', name, visible: visible(el), disabled: Boolean(el.disabled) || el.getAttribute('aria-disabled') === 'true',
      value: el.value ?? null, invalid: el.getAttribute('aria-invalid'), describedby: el.getAttribute('aria-describedby'),
      role: el.getAttribute('role') || (el.tagName === 'DIALOG' ? 'dialog' : ''), modal: el.getAttribute('aria-modal') === 'true' || (el.tagName === 'DIALOG' && el.matches(':modal')),
      active: document.activeElement === el, tag: el.tagName, textContent: el.textContent || ''};
  }, selector);
}
async function text(page, selector) {
  const result = await readControl(page, selector);
  return result?.visible ? norm(result.text) : '';
}
async function focusTo(page, selector, limit = 180) {
  for (let i = 0; i < limit; i++) {
    if (await page.evaluate(sel => document.activeElement === document.querySelector(sel), selector)) return;
    await page.keyboard.press('Tab');
  }
  throw new ContractFailure(`Keyboard Tab could not reach ${selector} within ${limit} transitions.`);
}
async function activate(page, selector) {
  const el = await readControl(page, selector);
  if (!el?.visible || el.disabled) throw new ContractFailure(`Required control ${selector} missing, hidden, or disabled.`);
  await focusTo(page, selector);
  await page.keyboard.press('Enter');
}
async function chord(page, modifier, key) {
  await page.keyboard.down(modifier);
  try { await page.keyboard.press(key); } finally { await page.keyboard.up(modifier); }
}
async function typeText(page, selector, value) {
  await focusTo(page, selector);
  await chord(page, 'Control', 'a');
  await page.keyboard.type(value);
}
async function setDateISO(page, iso) {
  // A normal input control is the sole DOM mutation performed by this module.
  // Native date display order varies by locale; assigning its ISO value avoids
  // pretending MM/DD versus DD/MM keyboard sequences are portable.
  await focusTo(page, '#return-date');
  const assigned = await page.evaluate(value => {
    const input = document.querySelector('#return-date');
    if (!(input instanceof HTMLInputElement) || input.type !== 'date') return {validControl:false};
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('change', {bubbles:true}));
    return {validControl:true, value:input.value, method:'native date input ISO value plus input/change; not keyboard segment-entry evidence'};
  }, iso);
  if (!assigned.validControl || assigned.value !== iso) throw new ContractFailure('Native date value could not be populated.');
  const bounds = await page.$eval('#return-date', input => ({min:input.min, max:input.max}));
  if ((!bounds.min || iso >= bounds.min) && (!bounds.max || iso <= bounds.max)) {
    // Select the day segment; the permitted window may fix the month.
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    const forward = !bounds.max || iso < bounds.max;
    await page.keyboard.press(forward ? 'ArrowUp' : 'ArrowDown');
    const edited = await page.$eval('#return-date', input => input.value);
    await page.keyboard.press(forward ? 'ArrowDown' : 'ArrowUp');
    const restored = await page.$eval('#return-date', input => input.value);
    if (edited === iso || restored !== iso) throw new ContractFailure('Focused native date did not support a reversible day-segment keyboard edit.');
    return {...assigned, keyboardEdit:{before:iso, edited, restored}};
  }
  return assigned;
}
async function modalTrap(page, selector) {
  const count = await page.evaluate(sel => {
    const root = document.querySelector(sel);
    return root ? Array.from(root.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')).filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length).length : 0;
  }, selector);
  if (!count) return {pass:false, observation:'No focusable modal controls.'};
  for (const backward of [false,true]) {
    for (let i = 0; i < count + 2; i++) {
      if (backward) await chord(page, 'Shift', 'Tab'); else await page.keyboard.press('Tab');
      const inside = await page.evaluate(sel => document.querySelector(sel)?.contains(document.activeElement) || false, selector);
      if (!inside) return {pass:false, observation:`Focus escaped modal during ${backward ? 'Shift+Tab' : 'Tab'}.`};
    }
  }
  return {pass:true, observation:`Forward and backward wrap exercised over ${count} focusable controls.`};
}
function reviewerResult(assertion, context) {
  const records = (context.evidence_records || []).filter(record => record.assertion_id === assertion.id);
  const accepted = records.filter(record => RESULTS.has(record.result) && record.evidence?.reference && record.evidence?.observation && record.evidence?.location && ['source','rendered','behavioral','measured'].includes(record.evidence?.kind));
  if (!accepted.length) return {id:assertion.id, result:'unverified', evidence:{kind:'inference', observation:'Independent review evidence not supplied. Runtime measurements do not prove source/trace authority or full visual/accessibility coverage.', requirement:assertion.requirement}};
  if (accepted.some(record => record.result === 'not_applicable') && assertion.category !== 'design') return {id:assertion.id,result:'unverified',evidence:{kind:'inference',observation:'Explicit noncompensable requirement cannot be removed by not_applicable; review needs correction.',records:accepted}};
  if (assertion.category === 'authority' && (!context.trace?.complete || !context.trace?.reference || !context.handoff?.reference)) return {id:assertion.id,result:'unverified',evidence:{kind:'inference',observation:'Authority review lacks complete retained trace or handoff reference.',records:accepted}};
  const nonUnknown = new Set(accepted.map(record => record.result).filter(value => value !== 'unverified'));
  if (nonUnknown.size > 1) return {id:assertion.id,result:'unverified',evidence:{kind:'inference',observation:'Conflicting review records require blind adjudication.',records:accepted}};
  return {id:assertion.id,result:[...nonUnknown][0] || 'unverified',evidence:{kind:'review',observation:'Imported provenance-bearing independent judgment; not a new automated measurement.',records:accepted}};
}

export async function evaluate(page, scenario, context = {}) {
  const assertions = new Map();
  const observations = [];
  const buckets = new Map();
  const finished = new Set();
  const check = (suffix, condition, observation, actual = undefined) => {
    const id = `${scenario.id}-${suffix}`;
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id).push({result:condition ? 'pass' : 'fail',observation,actual});
  };
  const done = (...suffixes) => suffixes.forEach(s => finished.add(`${scenario.id}-${s}`));
  const observe = (state, detail) => observations.push({state,context_id:context.context_id || 'unknown',detail});
  const hasFields = (rendered, record, excluded = []) => Object.entries(record).filter(([key]) => !excluded.includes(key)).every(([,value]) => rendered.includes(norm(value === null ? 'Unknown' : value)));
  const named = async (selector, name) => {
    const control = await readControl(page, selector);
    return Boolean(control?.visible && norm(control.name) === norm(name));
  };

  if (scenario.evaluator_assertions.every(a => a.method !== 'runtime')) {
    const plan = context.artifacts?.plan;
    const headings = ['Decision rules','Record walkthrough','Change map','Keyboard and recovery','Narrow and scaled content','Proposed validation','Work performed'];
    check('deliverable', typeof plan === 'string' && headings.every(h => norm(plan).includes(h)), 'Planning artifact contains all explicitly requested headings; content correctness remains independent review.', {headings,artifact_present:typeof plan === 'string'});
    done('deliverable');
    observe('planning-only', {page_used:false,unchanged_inventory_reference:context.artifacts?.unchanged_inventory_reference || null,plan_present:typeof plan === 'string'});
  } else if (!page) {
    observe('infrastructure', 'No Puppeteer page supplied; runtime assertions remain unverified.');
  } else {
    evaluationContexts.set(page, context);
    try {
      await applyTextScale(page);
      const geometry = await page.evaluate(() => ({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyText:document.body.innerText}));
      const expected = {wide:[1440,1000,1],narrow:[320,900,1],text200:[320,900,2]}[context.context_id];
      const scaleEvidence = context.text_scale !== 2 || Boolean(context.text_scaling_evidence?.method && context.text_scaling_evidence?.evidence_path && typeof context.ensureTextScale === 'function' && typeof context.observeTextScale === 'function');
      const correctContext = Boolean(expected && geometry.width === expected[0] && geometry.height === expected[1] && context.text_scale === expected[2] && scaleEvidence);
      observe('context', {actual:geometry,requested:expected || null,text_scaling_evidence:context.text_scaling_evidence || null,matched:correctContext,horizontal_overflow:geometry.scrollWidth > geometry.width});
      if (!correctContext) observe('infrastructure', 'Undeclared/mismatched viewport or unsupported text-scale claim: runtime passes will be downgraded to unverified. Observed failures remain failures.');
      const fixture = scenario.input_fixture;
      if (scenario.id === 'V2-01') {
        for (const [index,run] of fixture.runs.entries()) {
          check('details', await named(`#view-${run.id}`,`View run ${run.id}`), `Trigger ${run.id} has the required accessible name.`);
          await activate(page, `#view-${run.id}`);
          const dialog = await readControl(page,'#run-dialog');
          const detail = await text(page,'#run-details');
          check('details', Boolean(dialog?.visible && dialog.modal && dialog.role === 'dialog' && norm(dialog.name) === 'Run details'), 'Named modal dialog is open.', dialog);
          check('details', hasFields(detail,run) && fixture.runs.filter(r => r.id !== run.id).every(r => !detail.includes(norm(r.note))), `Complete matching details for ${run.id}, not the other note.`,detail);
          const focusInside = await page.evaluate(() => document.querySelector('#run-dialog')?.contains(document.activeElement) || false);
          check('keyboard', focusInside && await named('#close-run','Close run details'), 'Opening moves focus inside modal and provides named close control.');
          const trap = await modalTrap(page,'#run-dialog');
          check('keyboard',trap.pass,trap.observation);
          if (index === 0) await activate(page,'#close-run'); else await page.keyboard.press('Escape');
          // Observe settled restoration, including the native queued close event.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          check('keyboard', Boolean((await readControl(page,`#view-${run.id}`))?.active) && !(await readControl(page,'#run-dialog'))?.visible, 'Close button/Escape closes dialog and restores exact invoking trigger.',run.id);
          observe(`details-${run.id}`,{detail,closed_by:index === 0 ? 'button' : 'Escape'});
        }
        done('details','keyboard');
      } else if (scenario.id === 'V2-02') {
        check('scope',await named('#scope','Storage scope'),'Scope native select has required accessible name.');
        for (const scope of ['all','dry','cold']) {
          await focusTo(page,'#scope');
          // Native select interaction through Puppeteer's normal control API.
          await page.select('#scope',scope);
          const expectedScope = scenario.expected_values.scopes[scope];
          for (const [id,value] of Object.entries(expectedScope)) {
            if (id !== 'rows') check('scope',(await text(page,`#${id}`)) === norm(value), `${scope}: ${id} equals fixture oracle.`,await text(page,`#${id}`));
          }
          for (const lot of fixture.lots) {
            const row = await text(page,`#lot-${lot.id}`);
            const present = expectedScope.rows.includes(lot.id);
            check('scope',Boolean(row) === present,`${scope}: ${lot.id} row visibility matches scope.`,row);
            if (present) {
              const store = lot.store === 'dry' ? 'Dry cabinet' : 'Cold vault';
              const measured = lot.measured_g === null ? (row.match(/Unknown/g) || []).length >= 2 && !row.includes('0.000 g') : row.includes(`${lot.measured_g} g`);
              check('rows',row.includes(lot.id) && row.includes(lot.species) && row.includes(store) && row.includes(`${lot.recorded_g} g`) && measured, `${scope}: exact supplied species/store/source masses, including unknown measurement AND unknown variance versus measured zero.`,row);
              if (lot.measured_g !== null) {
                const delta = Number(lot.measured_g.replace('.','')) - Number(lot.recorded_g.replace('.',''));
                const signed = n => (delta < 0 ? '-' : delta > 0 ? '+' : '') + n + ' g';
                const exact = signed((Math.abs(delta)/1000).toFixed(3));
                const rounded = signed((Math.floor((Math.abs(delta)+5)/10)/100).toFixed(2));
                check('rows',row.includes(exact) || row.includes(rounded),`${scope}: row variance measured minus recorded, using permitted exact or rounded presentation.`,{id:lot.id,exact,rounded,row});
              }
            }
          }
          observe(`scope-${scope}`,expectedScope);
        }
        done('scope','rows');
      } else if (scenario.id === 'V2-03') {
        const examine = async (state,responseIndex) => {
          const status = await readControl(page,'#board-status');
          check('states',Boolean(status?.visible) && norm(status.text) === norm(fixture.messages[state]),`Exact ${state} status message.`,status);
          const pending = ['loading','refreshing'].includes(state);
          check('states',Boolean((await readControl(page,'#refresh'))?.disabled) === pending,'Refresh is disabled exactly while pending.');
          for (const id of ['CF1','CF2']) {
            const row = await text(page,`#sailing-${id}`);
            if (responseIndex === null) check('data',!row,'No invented departure data during initial loading.',row);
            else {
              const expectedRow = fixture.responses[responseIndex].sailings.find(r => r.id === id);
              const spaces = await text(page,`#spaces-${id}`);
              check('data',hasFields(row,expectedRow,['id','vehicle_spaces']) && spaces === String(expectedRow.vehicle_spaces === null ? 'Unknown' : expectedRow.vehicle_spaces),`${state}: all fields and exact scoped vehicle-space value from last successful ${id} response.`,{row,spaces});
            }
          }
          const timestamp = await text(page,'#updated-at');
          check('data',responseIndex === null ? !timestamp : timestamp === norm(fixture.responses[responseIndex].timestamp),`${state}: exact last-success timestamp, absent before any success.`,timestamp);
          observe(state,{status,timestamp});
        };
        check('states',await named('#refresh','Refresh departures') && await named('#settle','Complete pending response'),'Refresh and fixture-completion controls have required accessible names.');
        await examine('loading',null);
        await activate(page,'#settle'); await examine('ready',0);
        await activate(page,'#refresh'); await examine('refreshing',0);
        await activate(page,'#settle'); await examine('stale',0);
        check('states',await named('#retry','Retry departures'),'Failure exposes named retry control.');
        await activate(page,'#retry'); await examine('refreshing',0);
        await activate(page,'#settle'); await examine('recovered',2);
        done('states','data');
      } else if (scenario.id === 'V2-04') {
        const errors = fixture.errors;
        const valid = fixture.validation_examples.valid;
        for (const [id,name] of [['borrower','Borrower name'],['return-date','Return date'],['purpose','Intended use'],['review-loan','Review loan']]) check('keyboard',await named(`#${id}`,name),`Accessible name ${name}.`);
        await activate(page,'#review-loan');
        const summary = await readControl(page,'#error-summary');
        check('validation',Boolean(summary?.visible && summary.active),'Empty submission focuses visible error summary.',summary);
        check('validation',!(await readControl(page,'#review-dialog'))?.visible,'Invalid submission does not open review.');
        for (const [id,message] of Object.entries(errors)) {
          const input = await readControl(page,`#${id}`);
          const association = await page.evaluate(({id,message}) => {
            const el = document.getElementById(id);
            return (el?.getAttribute('aria-describedby') || '').split(/\s+/).some(ref => document.getElementById(ref)?.innerText.includes(message));
          },{id,message});
          check('validation',input?.invalid === 'true' && association && norm(summary?.text).includes(message),`Field ${id} has exact error, aria-invalid and describedby association.`);
          const link = `#error-summary a[href="#${id}"]`;
          await activate(page,link);
          check('validation',Boolean((await readControl(page,`#${id}`))?.active),`Summary link focuses ${id}.`);
        }
        await typeText(page,'#borrower',valid.borrower);
        await typeText(page,'#purpose',valid.purpose);
        const invalidDate = await setDateISO(page,fixture.validation_examples.invalid_date);
        observe('date-entry',invalidDate);
        check('validation',invalidDate.validControl && invalidDate.value === fixture.validation_examples.invalid_date,'Native ISO date control receives out-of-range value without locale assumptions.');
        await activate(page,'#review-loan');
        check('validation',Boolean((await readControl(page,'#error-summary'))?.active) && (await text(page,'#error-summary')).includes(errors['return-date']) && !(await readControl(page,'#review-dialog'))?.visible,'Out-of-range date rejected with summary focus; review stays closed.');
        done('validation');
        const dateEntry = await setDateISO(page,valid['return-date']);
        check('record',dateEntry.value === valid['return-date'],'ISO date control retains actual submitted value.',dateEntry);
        observe('date-entry',dateEntry);
        const inspectReview = async () => {
          const dialog = await readControl(page,'#review-dialog');
          const rendered = norm(dialog?.text);
          check('record',hasFields(rendered,valid) && rendered.includes(norm(fixture.tool)) && rendered.includes(norm(fixture.pickup)),'Review contains all entered values and complete tool/pickup facts.',rendered);
          check('keyboard',Boolean(dialog?.visible && dialog.modal && norm(dialog.name) === 'Review loan request') && Boolean((await readControl(page,'#back-editing'))?.active),'Named modal opens with Back to editing focus.');
          const trap = await modalTrap(page,'#review-dialog'); check('keyboard',trap.pass,trap.observation);
        };
        await activate(page,'#review-loan'); await inspectReview();
        await page.keyboard.press('Escape');
        check('keyboard',!(await readControl(page,'#review-dialog'))?.visible && Boolean((await readControl(page,'#review-loan'))?.active),'Escape restores Review loan focus.');
        await activate(page,'#review-loan'); await inspectReview();
        check('keyboard',await named('#back-editing','Back to editing'),'Cancellation control has required name.');
        await activate(page,'#back-editing');
        check('keyboard',!(await readControl(page,'#review-dialog'))?.visible && Boolean((await readControl(page,'#review-loan'))?.active),'Back to editing restores Review loan focus.');
        for (const [id,value] of Object.entries(valid)) check('record',(await readControl(page,`#${id}`))?.value === value,`Cancellation retains ${id}.`);
        await activate(page,'#review-loan'); await inspectReview();
        check('keyboard',await named('#confirm-loan','Confirm local request'),'Confirmation control has required name.');
        await activate(page,'#confirm-loan');
        const confirmation = await readControl(page,'#confirmation');
        check('record',Boolean(confirmation?.visible) && hasFields(norm(confirmation.text),valid) && norm(confirmation.text).includes(norm(fixture.confirmation)),'Visible local-only confirmation contains all submitted values.',confirmation);
        check('keyboard',Boolean(confirmation?.active) && !(await readControl(page,'#review-dialog'))?.visible,'Confirmation closes dialog and focuses success region.');
        observe('keyboard-scope','Navigation, corrections to text inputs, validation links, modal trapping/cancellation and confirmation exercised by keyboard. Date values filled through native ISO control; manual access review must exercise keyboard date segment editing and its locale-specific UI.');
        done('keyboard','record');
      } else if (scenario.id === 'V2-06') {
        const body = await text(page,'body');
        check('content',body.includes('Fenwick Mycology Cabinet') && body.includes(norm(fixture.safety_note)),'Collection title and complete safety note rendered.');
        for (const record of fixture.records) check('content',hasFields(await text(page,`#specimen-${record.id}`),record),'Every specimen field rendered, unknown determiner not invented.',record.id);
        done('content');
        check('toggle',await named('#toggle-locations','Hide precise locations'),'Initial location toggle name.');
        await activate(page,'#toggle-locations');
        check('toggle',await named('#toggle-locations','Show precise locations'),'Hidden-state toggle name.');
        for (const record of fixture.records) {
          const rendered = await text(page,`#specimen-${record.id}`);
          check('toggle',!rendered.includes(record.grid) && rendered.includes(record.district),'Precise grid not rendered, district retained.',{id:record.id,rendered});
        }
        await activate(page,'#toggle-locations');
        check('toggle',await named('#toggle-locations','Hide precise locations'),'Restored-state toggle name.');
        for (const record of fixture.records) check('toggle',(await text(page,`#specimen-${record.id}`)).includes(record.grid),'Every exact grid restored.',record.id);
        observe('hidden-accessibility-tree','Rendered text checks do not prove accessibility-tree exclusion; independent access review must inspect hidden-grid accessibility state.');
        done('toggle');
      } else if (scenario.id === 'V2-07') {
        const body = await text(page,'body');
        check('content',body.includes(norm(fixture.introduction)) && body.includes(norm(fixture.limitation)),'Full collection introduction and limitation rendered.');
        for (const session of fixture.sessions) check('content',body.includes(norm(session.title)) && await named(`#open-${session.id}`,`Read field note ${session.id}`),'Initial session title visible and trigger has required accessible name.',session.id);
        for (const session of fixture.sessions) {
          await activate(page,`#open-${session.id}`);
          const note = await text(page,'#field-note');
          check('content',hasFields(note,session) && fixture.sessions.filter(s => s.id !== session.id).every(s => !note.includes(norm(s.observation))),'Selected region contains complete matching note/metadata only.',{id:session.id,note});
          check('navigation',Boolean((await readControl(page,'#note-heading'))?.active),'Opening focuses note heading.');
          const region = await readControl(page,'#field-note');
          check('navigation',Boolean(region?.visible && region.name) && await named('#return-sessions','Return to sessions'),'Note region and return control are named.');
          await activate(page,'#return-sessions');
          check('navigation',Boolean((await readControl(page,`#open-${session.id}`))?.active),'Returning restores exact invoking session trigger.',session.id);
          observe(`note-${session.id}`,note);
        }
        done('content','navigation');
      } else {
        observe('infrastructure',`Unknown scenario ${scenario.id}; no guessed oracle applied.`);
      }
      if (context.text_scale === 2 && typeof context.observeTextScale === 'function') {
        const scaling = await context.observeTextScale();
        observe('text-scaling-final',scaling);
        if (!scaling || scaling.verified !== true) finished.clear();
      }
      if (!correctContext) for (const id of finished) finished.delete(id);
    } catch (error) {
      // Infrastructure exceptions after some completed paths cannot certify the
      // scaled/current context; retain failures but downgrade partial passes.
      if (!(error instanceof ContractFailure)) finished.clear();
      observe(error instanceof ContractFailure ? 'blocked-path' : 'infrastructure', {name:error.name,message:error.message});
      if (error instanceof ContractFailure) {
        // An observed unreachable required control is a real primary-path failure,
        // not an unobserved failure of every downstream data/access assertion.
        const primary = scenario.evaluator_assertions.find(a => a.method === 'runtime' && a.category === 'task') || scenario.evaluator_assertions.find(a => a.method === 'runtime');
        if (primary) {
          if (!buckets.has(primary.id)) buckets.set(primary.id,[]);
          buckets.get(primary.id).push({result:'fail',observation:error.message});
        }
      }
    }
  }
  for (const assertion of scenario.evaluator_assertions) {
    if (assertion.method === 'review') assertions.set(assertion.id,reviewerResult(assertion,context));
    else {
      const checks = buckets.get(assertion.id) || [];
      let result = checks.some(c => c.result === 'fail') ? 'fail' : finished.has(assertion.id) ? 'pass' : 'unverified';
      if (assertion.method === 'planning' && result === 'pass') {
        const contentReview = reviewerResult(assertion,context);
        checks.push({result:contentReview.result,observation:'Heading presence is not proof of an actionable plan; independent deliverable-content review is required.',review:contentReview.evidence});
        result = contentReview.result === 'not_applicable' ? 'unverified' : contentReview.result;
      }
      assertions.set(assertion.id,{id:assertion.id,result,evidence:{kind:assertion.method === 'planning' ? 'source' : 'behavioral',context_id:context.context_id || 'unknown',location:scenario.id === 'V2-05' ? 'artifacts.plan' : 'index.html',observation:result === 'unverified' ? 'Required observation incomplete; successful partial checks are not a pass.' : 'See individual observed checks.',checks}});
    }
  }
  return {scenario_id:scenario.id,context_id:context.context_id || 'unknown',assertions:[...assertions.values()],observations};
}

export async function evaluateCase({page = null, scenario, context = {}, ...metadata}) {
  return evaluate(page,scenario,{...metadata,...context});
}

// These reference implementations are intentionally evaluator-only. They are
// independent explicit oracles, not starter code and not evidence of execution.
const referenceCSS = `*{box-sizing:border-box}body{font:18px/1.5 system-ui;margin:0;background:#f5f0e4;color:#172e38}main,header,footer{max-width:65rem;margin:auto;padding:1rem}button,input,select,textarea{font:inherit;max-width:100%;padding:.5rem}button{cursor:pointer}article,section{margin-block:1rem;padding:.8rem;border:1px solid #567}h1,h2,p,dd,button{overflow-wrap:anywhere}dl{margin:0}dd{margin:0 0 .7rem}label{display:block;margin-top:1rem}:focus-visible{outline:3px solid #b54a14;outline-offset:3px}dialog{max-width:calc(100vw - 2rem);width:42rem;max-height:85vh;overflow:auto;padding:1rem}dialog::backdrop{background:#0008}[hidden]{display:none!important}.scroll{overflow:auto;max-width:100%}table{border-collapse:collapse;min-width:42rem}th,td{padding:.5rem;border:1px solid #567;text-align:left}.meta{font-family:monospace}`;
function documentHTML(title, body, script = '', css = referenceCSS) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)}</title><style>${css}</style></head><body>${body}<script>${script.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
}
function dataLiteral(data) { return JSON.stringify(data).replace(/</g,'\\u003c'); }
const browserHelpers = `const esc=v=>String(v??'Unknown').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const fields=o=>'<dl>'+Object.entries(o).map(([k,v])=>'<dt>'+esc(k)+'</dt><dd'+(k==='vehicle_spaces'?' id="spaces-'+o.id+'"':'')+'>'+esc(v)+'</dd>').join('')+'</dl>';document.addEventListener('keydown',e=>{const d=document.querySelector('dialog:modal');if(!d||e.key!=='Tab')return;const controls=Array.from(d.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')).filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});`;

export function makeReferenceFixture(scenario) {
  const f = scenario.input_fixture;
  let html;
  if (scenario.id === 'V2-01') {
    const baseline = scenario.starter_files['index.html'];
    const dialog = '<dialog id="run-dialog" aria-labelledby="run-title"><h2 id="run-title">Run details</h2><div id="run-details"></div><button id="close-run" autofocus>Close run details</button></dialog>';
    const script = `${browserHelpers}const runs=${dataLiteral(f.runs)};const modal=document.querySelector('#run-dialog');let origin;for(const run of runs)document.getElementById('view-'+run.id).onclick=e=>{origin=e.currentTarget;document.querySelector('#run-details').innerHTML=fields(run);modal.showModal();document.querySelector('#close-run').focus()};document.querySelector('#close-run').onclick=()=>modal.close();modal.addEventListener('close',()=>origin.focus());`;
    html = baseline.replace(/<script>[\s\S]*?<\/script>/,dialog + `<script>${script}</script>`).replace('</style>','dialog{max-width:calc(100vw - 2rem);width:40rem;max-height:85vh;overflow:auto;padding:1rem}dialog::backdrop{background:#0009}dd{margin:0 0 1rem;overflow-wrap:anywhere}:focus-visible{outline:3px solid white;outline-offset:3px}</style>');
  } else if (scenario.id === 'V2-02') {
    const body = '<main><h1>Seed-bank reconciliation</h1><p>'+escapeHTML(f.as_of)+' · '+escapeHTML(f.notes)+'</p><p>Totals exclude unknown measurements and are not a whole-collection mass. Variance = measured minus recorded.</p><label for="scope">Storage scope</label><select id="scope"><option value="all">All stores</option><option value="dry">Dry cabinet</option><option value="cold">Cold vault</option></select><dl><dt>Known recorded mass</dt><dd id="recorded-total"></dd><dt>Known measured mass</dt><dd id="measured-total"></dd><dt>Variance</dt><dd id="variance-total"></dd><dt>Excluded unknown lots</dt><dd id="unknown-count"></dd></dl><div class="scroll" role="region" aria-label="Lot mass comparison" tabindex="0"><table><thead><tr><th>Lot</th><th>Species</th><th>Store</th><th>Recorded mass</th><th>Measured mass</th><th>Variance</th></tr></thead><tbody id="lots"></tbody></table></div></main>';
    const script = `${browserHelpers}const lots=${dataLiteral(f.lots)};const milli=s=>s===null?null:Number(s.replace('.',''));const fmt=(n,sign=false)=>{const cents=Math.floor((Math.abs(n)+5)/10);return(n<0?'-':sign&&n>0?'+':'')+(cents/100).toFixed(2)+' g'};function render(){const scope=document.querySelector('#scope').value;const rows=lots.filter(l=>scope==='all'||l.store===scope);const known=rows.filter(l=>l.measured_g!==null);let a=0,b=0;for(const l of known){a+=milli(l.recorded_g);b+=milli(l.measured_g)}for(const [id,v]of Object.entries({'recorded-total':fmt(a),'measured-total':fmt(b),'variance-total':fmt(b-a,true),'unknown-count':String(rows.length-known.length)}))document.getElementById(id).textContent=v;document.querySelector('#lots').innerHTML=rows.map(l=>'<tr id="lot-'+l.id+'"><th scope="row">'+l.id+'</th><td>'+esc(l.species)+'</td><td>'+(l.store==='dry'?'Dry cabinet':'Cold vault')+'</td><td>'+l.recorded_g+' g</td><td>'+(l.measured_g===null?'Unknown':l.measured_g+' g')+'</td><td>'+(l.measured_g===null?'Unknown':((milli(l.measured_g)-milli(l.recorded_g))>0?'+':'')+((milli(l.measured_g)-milli(l.recorded_g))/1000).toFixed(3)+' g')+'</td></tr>').join('')}document.querySelector('#scope').onchange=render;render();`;
    html = documentHTML(scenario.title,body,script);
  } else if (scenario.id === 'V2-03') {
    const body = '<main><h1>Wren Channel departures</h1><p>Local scripted observations — not a booking service.</p><p id="board-status" role="status" aria-live="polite"></p><p id="updated-at"></p><div id="sailings"></div><button id="refresh">Refresh departures</button> <button id="retry" hidden>Retry departures</button> <button id="settle">Complete pending response</button></main>';
    const script = `${browserHelpers}const f=${dataLiteral(f)};let index=0,pending=true,last=null;const status=document.querySelector('#board-status'),refresh=document.querySelector('#refresh'),retry=document.querySelector('#retry'),settle=document.querySelector('#settle');function show(key){status.textContent=f.messages[key];refresh.disabled=pending;settle.disabled=!pending;retry.hidden=key!=='stale';document.querySelector('#updated-at').textContent=last?last.timestamp:'';document.querySelector('#sailings').innerHTML=last?last.sailings.map(s=>'<article id="sailing-'+s.id+'">'+fields(s)+'</article>').join(''):''}function start(){pending=true;show('refreshing')}refresh.onclick=start;retry.onclick=start;settle.onclick=()=>{if(!pending)return;const r=f.responses[index++];pending=false;if(r.outcome==='success'){last=r;show(index===1?'ready':'recovered')}else show('stale')};show('loading');`;
    html = documentHTML(scenario.title,body,script);
  } else if (scenario.id === 'V2-04') {
    const body = '<main><h1>Local torque-wrench loan request</h1><p>'+escapeHTML(f.tool)+'</p><p>'+escapeHTML(f.pickup)+'</p><form novalidate><div id="error-summary" tabindex="-1" role="alert" hidden></div><label for="borrower">Borrower name</label><input id="borrower" aria-describedby="err-borrower"><p id="err-borrower"></p><label for="return-date">Return date</label><input id="return-date" type="date" min="'+f.min_return_date+'" max="'+f.max_return_date+'" aria-describedby="err-return-date"><p id="err-return-date"></p><label for="purpose">Intended use</label><textarea id="purpose" aria-describedby="err-purpose"></textarea><p id="err-purpose"></p><button id="review-loan">Review loan</button></form><dialog id="review-dialog" aria-labelledby="review-title"><h2 id="review-title">Review loan request</h2><div id="review-values"></div><button id="back-editing" autofocus>Back to editing</button> <button id="confirm-loan">Confirm local request</button></dialog><section id="confirmation" role="status" tabindex="-1" hidden></section></main>';
    const script = `${browserHelpers}const f=${dataLiteral(f)};const ids=['borrower','return-date','purpose'];const modal=document.querySelector('#review-dialog'),summary=document.querySelector('#error-summary');let values={};document.querySelector('form').onsubmit=e=>{e.preventDefault();values=Object.fromEntries(ids.map(id=>[id,document.getElementById(id).value.trim()]));const bad=ids.filter(id=>id==='return-date'?(!values[id]||values[id]<f.min_return_date||values[id]>f.max_return_date):!values[id]);for(const id of ids){document.getElementById(id).setAttribute('aria-invalid',bad.includes(id)?'true':'false');document.getElementById('err-'+id).textContent=bad.includes(id)?f.errors[id]:''}summary.hidden=!bad.length;summary.innerHTML=bad.map(id=>'<p><a href="#'+id+'">'+esc(f.errors[id])+'</a></p>').join('');summary.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).focus()});if(bad.length){summary.focus();return}document.querySelector('#review-values').innerHTML=fields(values)+'<p>'+esc(f.tool)+'</p><p>'+esc(f.pickup)+'</p>';modal.showModal();document.querySelector('#back-editing').focus()};document.querySelector('#back-editing').onclick=()=>modal.close();modal.addEventListener('close',()=>{if(document.querySelector('#confirmation').hidden)document.querySelector('#review-loan').focus()});document.querySelector('#confirm-loan').onclick=()=>{const c=document.querySelector('#confirmation');c.innerHTML='<h2>'+esc(f.confirmation)+'</h2>'+fields(values);c.hidden=false;modal.close();c.focus()};`;
    html = documentHTML(scenario.title,body,script);
  } else if (scenario.id === 'V2-05') {
    const plan = `## Decision rules\nEvaluate withdrawal first; withdrawn records offer neither audio nor transcript. Otherwise public permits audio and an existing transcript, reading-room permits an existing transcript but no desk audio, and null permits neither. Never generate a missing transcript, download or permission. Preserve each supplied notice exactly, including the complete withdrawal explanation.\n## Record walkthrough\nOH31: audio yes, transcript yes. OH32: audio no, transcript yes; display the exact reading-room notice. OH33: audio no, transcript no; withdrawal overrides public and display the exact withdrawal notice. OH34: audio no, transcript no despite file existence; show exact unknown-consent notice.\n## Change map\nIn ledger.js replace truthy consent with an explicit decision function taking withdrawn, consent and transcript existence; render facts and permitted action controls from its result. In index.html retain Alder Oral History Archive and staff reference identity, add named record sections, status/error area and a restrained responsive layout; no new files are required. Do not connect remote media in this planning assignment.\n## Keyboard and recovery\nUse real buttons labelled with record titles and actions. Tab reaches only available actions; unavailable audio is explanatory text, not a focus trap. A local reading panel would take focus to its heading, have a named Close control, support Escape and restore the originating control. Missing transcripts show an inline non-error notice, not a dead action. If an authorized future local resource fails, keep restrictions/facts visible, announce failure, offer Retry only for an authorized resource and restore focus without a new permission.\n## Narrow and scaled content\nStack record facts at 320px; permit wrapping titles and full notices without line clamp. At 200% text scaling keep the full OH33 explanation and action labels in normal flow; dialogs, if later implemented, scroll vertically with reachable close controls and no page-level horizontal overflow.\n## Proposed validation\nNOT EXECUTED. Unit-test the four decisions plus public/reading-room missing transcript and withdrawal with every consent. Compare exact notices with fixtures. In a future authorized browser inspect 1440x1000, 320x900 and text-only 200%; keyboard-test action naming, denied content, panel close/focus return, authorized-resource failure/retry, and absence of dead transcript links. Independently verify inventory and trace.\n## Work performed\nRead supplied source and rules and wrote this handoff only. No commands, file writes, app/browser launch, execution, network or runtime checks were performed.`;
    return {id:scenario.id+'-reference',scenario_id:scenario.id,kind:'planning',artifacts:{plan,unchanged_inventory_reference:'oracle/reference/unchanged-inventory'},handoff:{text:plan,reference:'oracle/reference/handoff'},expected_assertions:{'V2-05-deliverable':'unverified'},review_expectations:{'V2-05-deliverable':'pass','V2-05-rules':'pass','V2-05-recovery':'pass'},validation_recipe:'Call evaluate(null, scenario, {artifacts,...context}); independently review plan content/trace. Structural heading checks alone must remain unverified, not certify actionable content. Synthetic oracle metadata is not a trial-agent trace.'};
  } else if (scenario.id === 'V2-06') {
    const body = '<main><h1>Fenwick Mycology Cabinet</h1><p>'+escapeHTML(f.safety_note)+'</p><button id="toggle-locations">Hide precise locations</button>'+f.records.map(r=>'<section id="specimen-'+r.id+'"><h2>'+escapeHTML(r.id)+' · '+escapeHTML(r.taxon)+'</h2><dl>'+Object.entries(r).map(([key,value])=>'<dt>'+escapeHTML(key)+'</dt><dd'+(key==='grid'?' class="grid"':'')+'>'+escapeHTML(value===null?'Unknown':value)+'</dd>').join('')+'</dl></section>').join('')+'</main>';
    html = documentHTML(scenario.title,body,`let showing=true;document.querySelector('#toggle-locations').onclick=()=>{showing=!showing;document.querySelectorAll('.grid').forEach(el=>el.hidden=!showing);document.querySelector('#toggle-locations').textContent=showing?'Hide precise locations':'Show precise locations'};`);
  } else if (scenario.id === 'V2-07') {
    const body = '<main><header><h1>Mudflat Listening Transect</h1><p>'+escapeHTML(f.introduction)+'</p><p>'+escapeHTML(f.limitation)+'</p></header><div id="sessions">'+f.sessions.map(s=>'<article><p>'+escapeHTML(s.place)+' · '+escapeHTML(s.tide)+'</p><h2><button id="open-'+s.id+'" aria-label="Read field note '+s.id+'">'+escapeHTML(s.title)+'</button></h2></article>').join('')+'</div><section id="field-note" aria-labelledby="note-heading" hidden><h2 id="note-heading" tabindex="-1"></h2><div id="note-values"></div><button id="return-sessions">Return to sessions</button></section></main>';
    const script = `${browserHelpers}const sessions=${dataLiteral(f.sessions)};let origin;const panel=document.querySelector('#field-note');for(const s of sessions)document.getElementById('open-'+s.id).onclick=e=>{origin=e.currentTarget;document.querySelector('#note-heading').textContent=s.title;document.querySelector('#note-values').innerHTML=fields(s);panel.hidden=false;document.querySelector('#note-heading').focus()};document.querySelector('#return-sessions').onclick=()=>{panel.hidden=true;origin.focus()};`;
    html = documentHTML(scenario.title,body,script);
  } else throw new Error(`Unknown oracle scenario ${scenario.id}`);
  return {id:scenario.id+'-reference',scenario_id:scenario.id,kind:'html',files:{'index.html':html},html,expected_assertions:Object.fromEntries(scenario.evaluator_assertions.filter(a=>a.method==='runtime').map(a=>[a.id,'pass'])),validation_recipe:'In a disposable oracle workspace serve these files with owner-approved local preview, load a fresh page at each protocol context, then call evaluate(page, scenario, context). Do not load reference source into a trial workspace. Review assertions intentionally remain unverified without independent evidence.'};
}

export function makeBrokenFixtures(scenario) {
  const reference = makeReferenceFixture(scenario);
  if (reference.kind === 'planning') return [
    {...reference,id:scenario.id+'-missing-section',artifacts:{...reference.artifacts,plan:reference.artifacts.plan.replace('## Change map','## Omitted')},expected_assertions:{'V2-05-deliverable':'fail'},review_expectations:{}},
    {...reference,id:scenario.id+'-wrong-consent',artifacts:{...reference.artifacts,plan:reference.artifacts.plan.replace('OH34: audio no, transcript no despite file existence','OH34: audio no, transcript yes because file exists')},expected_assertions:{'V2-05-deliverable':'unverified'},review_expectations:{'V2-05-rules':'fail'},validation_recipe:'Manual negative control: section presence alone must not pass rules. Independent reviewer must catch invented transcript permission; absent reviewer evidence rules stays unverified.'}
  ];
  const variants = [];
  const add = (name, transform, expected) => {
    const html = transform(reference.html);
    if (html === reference.html) throw new Error(`Oracle mutation did not apply: ${scenario.id}/${name}`);
    variants.push({...reference,id:scenario.id+'-'+name,html,files:{'index.html':html},expected_assertions:expected});
  };
  if (scenario.id === 'V2-01') {
    add('wrong-record',html=>html.replace('fields(run);modal.showModal()','fields(runs[0]);modal.showModal()'),{'V2-01-details':'fail'});
    add('wrong-focus',html=>html.replace("modal.addEventListener('close',()=>origin.focus())","modal.addEventListener('close',()=>document.querySelector('#view-NG-17').focus())"),{'V2-01-keyboard':'fail'});
  } else if (scenario.id === 'V2-02') {
    add('wrong-total',html=>html.replace("'variance-total':fmt(b-a,true)","'variance-total':'0.00 g'"),{'V2-02-scope':'fail'});
    add('unknown-as-zero',html=>html.replace("l.measured_g===null?'Unknown':l.measured_g+' g'","l.measured_g===null?'0.000 g':l.measured_g+' g'"),{'V2-02-rows':'fail'});
  } else if (scenario.id === 'V2-03') {
    add('discard-stale',html=>html.replace("else show('stale')","else {last=null;show('stale')}"),{'V2-03-data':'fail'});
    add('wrong-pending',html=>html.replace("refresh.disabled=pending","refresh.disabled=false"),{'V2-03-states':'fail'});
  } else if (scenario.id === 'V2-04') {
    add('wrong-range',html=>html.replace("values[id]>f.max_return_date","values[id]>'2031-08-31'"),{'V2-04-validation':'fail'});
    add('wrong-confirmation',html=>html.replace("fields(values);c.hidden=false","fields({...values,purpose:'Unrelated purpose'});c.hidden=false"),{'V2-04-record':'fail'});
  } else if (scenario.id === 'V2-06') {
    add('location-leak',html=>html.replace('el.hidden=!showing','el.hidden=false'),{'V2-06-toggle':'fail'});
    add('invented-determiner',html=>html.replaceAll('Unknown','Unrecorded expert'),{'V2-06-content':'fail'});
  } else if (scenario.id === 'V2-07') {
    add('wrong-note',html=>html.replace('fields(s);panel.hidden=false','fields(sessions[0]);panel.hidden=false'),{'V2-07-content':'fail'});
    add('wrong-return',html=>html.replace("panel.hidden=true;origin.focus()","panel.hidden=true;document.querySelector('#open-ML1').focus()"),{'V2-07-navigation':'fail'});
  }
  return variants;
}
export function oracleFixtures(scenario) { return [makeReferenceFixture(scenario),...makeBrokenFixtures(scenario)]; }
