#!/bin/bash

# scripts/compound/loop.sh
# Runs the agent in a loop until all tasks are complete or max iterations reached

set -e

MAX_ITERATIONS="${1:-25}"
ITERATION=0
PRD_FILE="scripts/compound/prd.json"

echo "$(date): Starting execution loop (max $MAX_ITERATIONS iterations)..." >> logs/auto-compound.log

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "$(date): Iteration $ITERATION of $MAX_ITERATIONS" >> logs/auto-compound.log

    # Check if there are remaining tasks
    if [ -f "$PRD_FILE" ]; then
        REMAINING=$(jq '[.tasks[] | select(.status != "done")] | length' "$PRD_FILE" 2>/dev/null || echo "0")

        if [ "$REMAINING" -eq 0 ]; then
            echo "$(date): All tasks complete!" >> logs/auto-compound.log
            break
        fi

        echo "$(date): $REMAINING tasks remaining" >> logs/auto-compound.log
    fi

    # Run Claude to execute the next task
    claude -p "Read the task list at $PRD_FILE. Find the first task that is NOT marked as 'done'. Execute that task completely, including writing tests if applicable. After completing the task, update the task's status to 'done' in $PRD_FILE. Commit your changes with a descriptive message. If you encounter a blocking error, mark the task as 'blocked' with the reason and move to the next task." --dangerously-skip-permissions

    # Small delay between iterations
    sleep 5
done

if [ $ITERATION -ge $MAX_ITERATIONS ]; then
    echo "$(date): WARNING: Reached max iterations ($MAX_ITERATIONS)" >> logs/auto-compound.log
fi

echo "$(date): Execution loop complete after $ITERATION iterations" >> logs/auto-compound.log
