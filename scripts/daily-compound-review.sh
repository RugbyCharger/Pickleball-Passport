#!/bin/bash

# scripts/daily-compound-review.sh
# Runs BEFORE auto-compound.sh to update CLAUDE.md with learnings

set -e

PROJECT_DIR="/Users/grantcharge/Pickleball-Passport"
cd "$PROJECT_DIR"

# Log start
echo "$(date): Starting daily compound review..." >> logs/compound-review.log

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Run Claude to review threads and compound learnings
claude -p "Load the compound-engineering skill. Look through and read each Claude Code thread from the last 24 hours. For any thread where we did NOT use the Compound Engineering skill to compound our learnings at the end, do so now - extract the key learnings from that thread and update the relevant CLAUDE.md files and docs/solutions/ so we can learn from our work and mistakes. Commit your changes and push to main." --dangerously-skip-permissions

echo "$(date): Compound review complete." >> logs/compound-review.log
