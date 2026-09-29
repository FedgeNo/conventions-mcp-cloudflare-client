# Conventions MCP Cloudflare Client

This is the local client for the
[Cloudflare Worker server](https://github.com/FedgeNo/conventions-mcp-cloudflare-worker).
Deploy your own Worker and save its bearer token before configuring this
client. The server repository has the [deployment steps](https://github.com/FedgeNo/conventions-mcp-cloudflare-worker#deploy-your-own-server).

The CLI reads a token from `~/.config/conventions-mcp-cloudflare/token` by
default. It also accepts a different file path in
`CONVENTIONS_MCP_AUTH_TOKEN_FILE`. The file must contain the exact
`MCP_AUTH_TOKEN` installed on your Worker. Keep it private and out of Git.

## Install

You need Node.js and npm, plus Codex or Claude Code. From a checkout of this
repository, install the CLI so the hosts can find it on `PATH`:

```sh
git clone https://github.com/FedgeNo/conventions-mcp-cloudflare-client.git
cd conventions-mcp-cloudflare-client
npm ci
npm install -g .
conventions-mcp-cloudflare cloudflare-headers
```

The last command should print JSON with `Authorization`,
`X-Conventions-Project`, and `X-Conventions-Machine` keys. Treat that output
as a secret: it contains the bearer token. If it reports a missing token
file, complete the server guide's token step first.

Replace `YOUR_WORKER_HOSTNAME` in the examples below with the hostname from
the URL printed by `wrangler deploy` (without `https://` or a trailing slash).
The MCP endpoint is `https://YOUR_WORKER_HOSTNAME/mcp`.

## Codex

Add this server block to `~/.codex/config.toml` (merge it with existing
settings):

```toml
[mcp_servers.conventions]
url = "https://YOUR_WORKER_HOSTNAME/mcp"
http_headers_helper = "conventions-mcp-cloudflare cloudflare-headers"
```

Merge the `SessionStart` and `PreToolUse` arrays from
`hooks/cloudflare-hooks.json` into `~/.codex/hooks.json`. Create that file
with the supplied JSON if it does not exist; preserve any existing hooks.
Start a new Codex session, open `/hooks`, and trust the new hooks so they
run. The session hook asks the agent to call `list_rules` first, and the
pre-tool hook blocks other supported tool calls until it does.

## Claude Code

Claude Code runs a user-scoped header helper from its configuration
directory, which would give every project the same project header. Add the
server at **local scope** from each project where you want these rules:

```sh
cd /path/to/your/project
claude mcp add-json --scope local conventions '{"type":"http","url":"https://YOUR_WORKER_HOSTNAME/mcp","headersHelper":"conventions-mcp-cloudflare cloudflare-headers"}'
```

Merge the `SessionStart` and `PreToolUse` arrays from this repository's
`hooks/cloudflare-hooks.json` into that project's
`.claude/settings.local.json`. Create the file with a `hooks` object if it
does not exist, and preserve any existing hooks. Keep this local settings
file out of Git. Repeat the server and hook setup for each project where
you use Conventions. Start Claude Code in that project, accept its trust
prompt, then use `/mcp` to confirm the server connected and `/hooks` to
confirm the hooks loaded.

## Use

In a new agent session, `list_rules` loads the global rules and the rules
for the current project. Ask the agent to save a durable rule with
`capture_thought`, revise one with `update_thought`, or find one with
`search_thoughts`. The hooks request a fresh `list_rules` call after a
context reset. The client stores only a temporary per-session marker that
the call was made; the rules themselves remain in D1.
