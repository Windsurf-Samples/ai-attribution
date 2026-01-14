#!/bin/bash

# Configure git to use .githooks directory for hooks
git config core.hooksPath .githooks
echo "Git hooks path set to .githooks"

if command -v git-ai &> /dev/null; then
    echo "git-ai found, upgrading..."
    git-ai upgrade
else
    echo "git-ai not found, installing..."
    curl -sSL https://usegitai.com/install.sh | bash
fi
