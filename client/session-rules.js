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
            additionalContext: 'Before your first tool call in this session, call the Cloudflare Conventions MCP server\'s list_rules tool once to load this project\'s standing conventions. Do not call it again unless context has been reset.',
        },
    }));
});
