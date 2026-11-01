#!/usr/bin/env bun
// Repository maintenance only. The host supplies one bounded trial over stdin.
import { mkdir, writeFile } from 'node:fs/promises';
import { runTask } from './pilot-agent.mjs';

const MAX_INPUT = 4 * 1024 * 1024;
const apiKey = process.env.PILOT_API_KEY;
const browserEndpoint = process.env.PILOT_BROWSER_RPC;
const browserToken = process.env.PILOT_BROWSER_TOKEN;
delete process.env.PILOT_API_KEY;
delete process.env.PILOT_BROWSER_RPC;
delete process.env.PILOT_BROWSER_TOKEN;
function serialize(value) {
  let text = JSON.stringify(value);
  for (const secret of [apiKey, browserToken]) if (secret) text = text.replaceAll(secret, '[REDACTED]');
  return text;
}
let emitted = false;
function emit(value) {
  if (emitted) return;
  emitted = true;
  process.stdout.write(`${serialize(value)}\n`);
}
try {
  let text = '';
  for await (const chunk of process.stdin) {
    text += chunk.toString('utf8');
    if (Buffer.byteLength(text) > MAX_INPUT) throw new Error('Worker input exceeds limit');
  }
  const c = JSON.parse(text);
  if (c.protocol !== 'peccable-pilot-worker-v1' || c.workspace !== '/trial/workspace' ||
      c.logPath !== '/trial/evidence/session.jsonl' ||
      !['edit', 'read-only', 'no-runtime'].includes(c.mode) ||
      ![null, '/skill'].includes(c.skillRoot) ||
      typeof c.brief !== 'string' || !c.limits || !c.model ||
      !apiKey || process.env.PILOT_MODULE_ROOT !== '/runtime/node_modules') {
    throw new Error('Invalid isolated worker contract');
  }
  await mkdir('/trial/evidence', { recursive: true });
  const browserAdapter = c.mode === 'edit' ? {
    actions: ['navigate', 'viewport', 'click', 'fill', 'select', 'keyboard', 'read', 'screenshot'],
    async invoke(action, args, { signal } = {}) {
      if (!browserEndpoint || !browserToken) throw new Error('Author browser unavailable');
      const response = await fetch(browserEndpoint, {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${browserToken}` },
        body: JSON.stringify({ action, args }), signal: signal || AbortSignal.timeout(30000),
      });
      const body = await response.json();
      if (!response.ok || body.error) throw new Error(body.error || 'Browser bridge rejected request');
      return body.result;
    },
  } : undefined;
  const result = await runTask({
    workspace: c.workspace, skillRoot: c.skillRoot, model: c.model,
    thinking: c.thinking, systemPrompt: c.systemPrompt, brief: c.brief,
    fixture: c.fixture, mode: c.mode, browserAdapter, logPath: c.logPath,
    allowedWritePaths: c.allowedWritePaths,
    maxTurns: c.limits.maxTurns, maxSeconds: c.limits.wallSeconds,
    maxToolCalls: c.limits.maxToolCalls,
    maxOutputTokensPerCall: c.limits.maxOutputTokensPerCall,
    maxResponseBytesPerCall: c.limits.maxResponseBytesPerCall,
    maxTraceBytes: c.limits.maxTraceBytes,
    taskId: c.taskId, runtimeRoot: process.env.PILOT_MODULE_ROOT,
    isolation: c.isolation, getApiKey: async () => apiKey,
  });
  await writeFile('/trial/evidence/author-result.json', `${serialize(result)}\n`, { mode: 0o600 });
  emit({ protocol: c.protocol, ok: true, result });
} catch (error) {
  const message = String(error?.message || error).replaceAll(apiKey || '\u0000', '[REDACTED]').replaceAll(browserToken || '\u0000', '[REDACTED]');
  emit({ protocol: 'peccable-pilot-worker-v1', ok: false, error: message });
  process.exitCode = 1;
}
