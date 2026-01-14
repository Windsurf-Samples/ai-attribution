#!/bin/sh
# OTEL Trace Export for Git Commits
# Usage: otel-export.sh <commit_hash>

set -e

COMMIT_HASH="${1:-$(git rev-parse HEAD)}"

# Get commit info
COMMIT_SHORT=$(git rev-parse --short "$COMMIT_HASH")
COMMIT_MSG=$(git log -1 --format=%s "$COMMIT_HASH")
COMMIT_AUTHOR=$(git log -1 --format=%an "$COMMIT_HASH")
COMMIT_EMAIL=$(git log -1 --format=%ae "$COMMIT_HASH")
COMMIT_TIMESTAMP=$(git log -1 --format=%ct "$COMMIT_HASH")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")

# Get git-ai stats (escape for JSON embedding)
GIT_AI_STATS=$(git-ai stats "$COMMIT_HASH" --json 2>/dev/null | tr -d '\n' | sed 's/"/\\"/g' || echo "{}")

# Configure OTEL endpoint (defaults to local demo-ui app)
OTEL_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:3000/api}/v1/traces"

# Generate trace and span IDs (32 and 16 hex chars respectively)
TRACE_ID=$(printf '%032x' "$(od -An -tu8 -N16 /dev/urandom | tr -d ' ')" 2>/dev/null || echo "$(date +%s%N)$(echo $COMMIT_HASH | cut -c1-16)" | md5 | cut -c1-32)
SPAN_ID=$(printf '%016x' "$(od -An -tu8 -N8 /dev/urandom | tr -d ' ')" 2>/dev/null || echo "$COMMIT_HASH" | md5 | cut -c1-16)

# Timestamps in nanoseconds
START_TIME_NS="${COMMIT_TIMESTAMP}000000000"
END_TIME_NS="$(date +%s)000000000"

# Build OTLP JSON payload
OTEL_PAYLOAD=$(cat <<EOF
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.name",
            "value": { "stringValue": "git-commit-tracker" }
          },
          {
            "key": "service.version",
            "value": { "stringValue": "1.0.0" }
          },
          {
            "key": "vcs.repository.name",
            "value": { "stringValue": "${REPO_NAME}" }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "git.post-commit",
            "version": "1.0.0"
          },
          "spans": [
            {
              "traceId": "${TRACE_ID}",
              "spanId": "${SPAN_ID}",
              "name": "git.commit",
              "kind": 1,
              "startTimeUnixNano": "${START_TIME_NS}",
              "endTimeUnixNano": "${END_TIME_NS}",
              "attributes": [
                {
                  "key": "vcs.commit.id",
                  "value": { "stringValue": "${COMMIT_HASH}" }
                },
                {
                  "key": "vcs.commit.id.short",
                  "value": { "stringValue": "${COMMIT_SHORT}" }
                },
                {
                  "key": "vcs.commit.message",
                  "value": { "stringValue": "${COMMIT_MSG}" }
                },
                {
                  "key": "vcs.commit.author.name",
                  "value": { "stringValue": "${COMMIT_AUTHOR}" }
                },
                {
                  "key": "vcs.commit.author.email",
                  "value": { "stringValue": "${COMMIT_EMAIL}" }
                },
                {
                  "key": "vcs.branch",
                  "value": { "stringValue": "${BRANCH}" }
                },
                {
                  "key": "git.ai.stats",
                  "value": { "stringValue": "${GIT_AI_STATS}" }
                }
              ],
              "status": {
                "code": 1
              }
            }
          ]
        }
      ]
    }
  ]
}
EOF
)

# Send to OTEL endpoint
if command -v curl >/dev/null 2>&1; then
  curl -s -X POST "${OTEL_ENDPOINT}" \
    -H "Content-Type: application/json" \
    -d "${OTEL_PAYLOAD}" \
    --connect-timeout 5 \
    --max-time 10 \
    >/dev/null 2>&1 &
  echo "OTEL trace sent to ${OTEL_ENDPOINT}"
else
  echo "Warning: curl not found, skipping OTEL export"
fi
