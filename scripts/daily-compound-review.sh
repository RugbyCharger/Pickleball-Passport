#!/bin/bash

# scripts/daily-compound-review.sh
# Runs BEFORE auto-compound.sh to update CLAUDE.md with learnings
# Uses the compound-engineering skill to extract learnings from threads

set -e

PROJECT_DIR="/Users/grantcharge/Pickleball-Passport"
cd "$PROJECT_DIR"

# Log start
echo "$(date): Starting daily compound review..." >> logs/compound-review.log

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Run Claude with the compound engineering skill to review threads and extract learnings
claude -p "Use the compound-engineering:workflows:compound skill. Look through all Claude Code threads from the last 24 hours. For any thread where we did NOT compound our learnings at the end, do so now - extract the key learnings and update the relevant CLAUDE.md files and docs/solutions/ so we can learn from our work and mistakes. Commit your changes and push to main." --dangerously-skip-permissions

echo "$(date): Compound review complete." >> logs/compound-review.log
