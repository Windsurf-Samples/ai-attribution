# How AI Attribution Works

This system tracks AI-assisted code contributions by connecting Windsurf IDE hooks to git-ai and exporting telemetry via OpenTelemetry (OTEL).

## Architecture Overview

```
Windsurf IDE → git-ai checkpoint → git commit → post-commit hook → OTEL export → Demo UI
```

## 1. Windsurf Hooks (`.windsurf/hooks.json`)

Windsurf fires hooks when code is written:

- **`pre_write_code`**: Called before Cascade writes code. Logs a `human` checkpoint to mark the boundary.
- **`post_write_code`**: Called after Cascade writes code. Logs an `ai_agent` checkpoint with file path and metadata.

These hooks pipe JSON to `git-ai checkpoint agent-v1 --hook-input stdin`, which records attribution data for later analysis.

## 2. Git Post-Commit Hook (`.githooks/post-commit`)

After each commit, the post-commit hook:

1. Creates a log directory at `commit_logs/<commit_hash>/`
2. Runs `git-ai stats <commit_hash> --json` to compute AI vs human line attribution
3. Calls `otel-export.sh` to send telemetry

## 3. OTEL Export (`.githooks/otel-export.sh`)

The export script:

1. Gathers commit metadata (hash, message, author, branch, repo)
2. Retrieves `git-ai stats` output (AI/human/mixed line counts)
3. Constructs an OTLP JSON payload with:
   - Resource attributes: `service.name`, `vcs.repository.name`
   - Span attributes: commit info + `git.ai.stats`
4. POSTs to `$OTEL_EXPORTER_OTLP_ENDPOINT/v1/traces` (defaults to `http://localhost:3000/api/v1/traces`)

## Data Flow Summary

| Stage | Component | Output |
|-------|-----------|--------|
| Code edit | Windsurf hooks | git-ai checkpoints |
| Commit | post-commit hook | `stats.json` + OTEL trace |
| Visualization | Demo UI | Real-time attribution dashboard |

## Environment Variables

- `OTEL_EXPORTER_OTLP_ENDPOINT`: Override the default OTEL endpoint (e.g., for remote webservice collectors)
