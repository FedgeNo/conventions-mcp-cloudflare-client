import { markRulesLoaded, rulesAreLoaded } from './hook-state.js';

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
    let payload = {};
    try {
        payload = JSON.parse(input || '{}');
    } catch {
        process.stdout.write('{}');
        return;
    }

    const toolName = payload.tool_name || '';
    if (toolName === 'list_rules' || toolName.endsWith('__list_rules')) {
        markRulesLoaded(payload.session_id);
        process.stdout.write('{}');
        return;
    }

    if (rulesAreLoaded(payload.session_id)) {
        process.stdout.write('{}');
        return;
    }

    process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: 'STOP. You must call the Cloudflare Conventions MCP server\'s list_rules tool before using any other tool. Call list_rules now, then retry this tool call.',
        },
    }));
});
