#!/bin/bash

# scripts/compound/analyze-report.sh
# Analyzes a prioritized report and outputs the top priority item as JSON

REPORT_FILE="$1"

if [ -z "$REPORT_FILE" ] || [ ! -f "$REPORT_FILE" ]; then
    echo '{"error": "No report file provided or file not found"}' >&2
    exit 1
fi

# Use Claude to analyze the report and extract the #1 priority
ANALYSIS=$(claude -p "Read the report at $REPORT_FILE. Extract the #1 highest priority item that should be implemented next. Output ONLY valid JSON with these fields:
{
  \"priority_item\": \"Brief description of the top priority feature/fix\",
  \"branch_name\": \"feature/short-kebab-case-name\",
  \"complexity\": \"low|medium|high\",
  \"rationale\": \"Why this is the top priority\"
}
No markdown, no explanation, just the JSON." --dangerously-skip-permissions 2>/dev/null)

echo "$ANALYSIS"
