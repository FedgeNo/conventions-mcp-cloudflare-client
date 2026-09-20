# conventions-mcp-cloudflare-client

Local client application for the Cloudflare-hosted Conventions MCP server.

This is the client half of the standalone Cloudflare implementation. It is
used with that Worker, not together with the separate local SQLite server.

## Install

From a checkout of this repository:

```sh
npm install
npm install -g .
```

Merge `hooks/cloudflare-hooks.json` into the relevant Codex or Claude hook
settings. The hooks require the remote `list_rules` call before other tools
and keep only a temporary loaded marker locally.

Configure the remote MCP client with:

```toml
url = "https://conventions-mcp-cloudflare.fedge-no.workers.dev/mcp"
http_headers_helper = "conventions-mcp-cloudflare cloudflare-project-headers"
```

The helper sends the current working directory and machine hostname as
`X-Conventions-Project` and `X-Conventions-Machine`.
