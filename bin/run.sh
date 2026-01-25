#!/bin/bash
set -e

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "../.venv" ]; then
    source ../.venv/bin/activate
fi

# Run the application
uvicorn app.main:app --host 0.0.0.0 --port 19187 --reload
