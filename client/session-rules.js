import { clearRulesLoaded } from './hook-state.js';

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
    let payload = {};
    try {
        payload = JSON.parse(input || '{}');
    } catch {
        // Still emit the reminder when the host sends malformed hook input.
    }

    if (payload.source === 'compact' || payload.source === 'clear') {
        clearRulesLoaded(payload.session_id);
    }

    process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
            hookEventName: 'SessionStart',
            additionalContext: 'Call the Cloudflare Conventions MCP server\'s list_rules before any other tool; repeat only after context reset. Do only explicitly authorized work. Suggest other work and wait for permission before doing it.',
        },
    }));
});
