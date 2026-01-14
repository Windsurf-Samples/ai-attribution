# OTEL Commit Viewer

A real-time UI for viewing git commit traces sent via OpenTelemetry.

## Setup

```bash
bun install
bun run dev
```

## Usage

1. Start the dev server: `bun run dev`
2. Configure your git hooks to point to this server:
   ```bash
   export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:3000/api"
   ```
3. Make commits and watch them appear in real-time!

## Deploy to Vercel

```bash
vercel
```

Or connect to GitHub for automatic deployments.

## API Endpoints

- `POST /api/v1/traces` - Receives OTLP trace payloads
- `GET /api/events` - SSE stream of incoming traces
