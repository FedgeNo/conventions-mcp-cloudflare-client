#!/usr/bin/env node
const command = process.argv[2];

if (command === 'cloudflare-project-headers') {
    const os = await import('node:os');
    console.log(JSON.stringify({
        'X-Conventions-Project': process.cwd(),
        'X-Conventions-Machine': os.hostname(),
    }));
} else if (command === 'hook-session-rules') {
    await import('./session-rules.js');
} else if (command === 'hook-pre-tool-check') {
    await import('./pre-tool-check.js');
} else {
    console.error('Usage: conventions-mcp-cloudflare [cloudflare-project-headers | hook-session-rules | hook-pre-tool-check]');
    process.exitCode = 1;
}
