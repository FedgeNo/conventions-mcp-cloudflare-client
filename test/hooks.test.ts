import { afterEach, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runtimeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'conventions-cloudflare-hooks-'));
const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

afterEach(() => {
    fs.rmSync(runtimeDirectory, { recursive: true, force: true });
    fs.mkdirSync(runtimeDirectory, { recursive: true, mode: 0o700 });
});

async function runHook(file: string, payload: Record<string, unknown>): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [file], {
            cwd: projectDirectory,
            env: { ...process.env, XDG_RUNTIME_DIR: runtimeDirectory },
        });
        let output = '';
        let error = '';
        child.stdout.on('data', (chunk: Buffer) => (output += chunk));
        child.stderr.on('data', (chunk: Buffer) => (error += chunk));
        child.on('error', reject);
        child.on('close', (code: number | null) => {
            if (code !== 0) {
                reject(new Error(error || `Hook exited with status ${code}`));
                return;
            }
            resolve(JSON.parse(output));
        });
        child.stdin.end(JSON.stringify(payload));
    });
}

describe('Cloudflare hooks', () => {
    it('reminds the model and rearms after compaction', async () => {
        const result = await runHook('client/session-rules.js', { source: 'compact', session_id: 'test' });
        expect(result.hookSpecificOutput.hookEventName).toBe('SessionStart');
        expect(result.hookSpecificOutput.additionalContext).toContain('Cloudflare Conventions MCP');
    });

    it('denies non-list tools until list_rules is observed', async () => {
        const denied = await runHook('client/pre-tool-check.js', { session_id: 'test', tool_name: 'mcp__conventions-mcp-cloudflare__search_thoughts' });
        expect(denied.hookSpecificOutput.permissionDecision).toBe('deny');

        const allowed = await runHook('client/pre-tool-check.js', { session_id: 'test', tool_name: 'mcp__conventions-mcp-cloudflare__list_rules' });
        expect(allowed).toEqual({});

        const next = await runHook('client/pre-tool-check.js', { session_id: 'test', tool_name: 'mcp__conventions-mcp-cloudflare__search_thoughts' });
        expect(next).toEqual({});
    });
});
