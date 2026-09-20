#!/usr/bin/env node
const command = process.argv[2];

if (command === 'cloudflare-project-headers' || command === 'cloudflare-headers') {
    const os = await import('node:os');
    const headers = {
        'X-Conventions-Project': process.cwd(),
        'X-Conventions-Machine': os.hostname(),
    };
    if (command === 'cloudflare-headers') {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const tokenPath = process.env.CONVENTIONS_MCP_AUTH_TOKEN_FILE || path.join(os.homedir(), '.config', 'conventions-mcp-cloudflare', 'token');
        const token = fs.readFileSync(tokenPath, 'utf8').trim();
        if (!token) throw new Error(`Empty Cloudflare MCP token: ${tokenPath}`);
        headers.Authorization = `Bearer ${token}`;
    }
    console.log(JSON.stringify(headers));
} else if (command === 'cloudflare-auth-header') {
    const fs = await import('node:fs');
    const os = await import('node:os');
    const path = await import('node:path');
    const tokenPath = process.env.CONVENTIONS_MCP_AUTH_TOKEN_FILE || path.join(os.homedir(), '.config', 'conventions-mcp-cloudflare', 'token');
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    if (!token) throw new Error(`Empty Cloudflare MCP token: ${tokenPath}`);
    console.log(JSON.stringify({ Authorization: `Bearer ${token}` }));
} else if (command === 'hook-session-rules') {
    await import('./session-rules.js');
} else if (command === 'hook-pre-tool-check') {
    await import('./pre-tool-check.js');
} else {
    console.error('Usage: conventions-mcp-cloudflare [cloudflare-headers | cloudflare-project-headers | cloudflare-auth-header | hook-session-rules | hook-pre-tool-check]');
    process.exitCode = 1;
}
