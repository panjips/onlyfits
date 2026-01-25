#!/bin/bash
set -e

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
if [ -f "pyproject.toml" ]; then
    echo "Installing dependencies..."
    pip install -e .
else
    echo "pyproject.toml not found"
    exit 1
fi

echo "Setup complete."
