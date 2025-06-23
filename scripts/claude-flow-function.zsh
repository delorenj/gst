#!/usr/bin/env zsh
# Claude-Flow ZSH function to use background mode automatically

claude-flow() {
    local script_dir="$(dirname "$0")"
    local bg_wrapper="${script_dir}/scripts/claude-flow-bg"
    
    # If the wrapper exists, use it
    if [[ -f "${bg_wrapper}" ]]; then
        "${bg_wrapper}" "$@"
    else
        # Fallback to direct execution with environment vars
        echo "⚠️  Running claude-flow with TTY workaround..."
        CI=1 NO_COLOR=1 FORCE_COLOR=0 command claude-flow "$@"
    fi
}

# Export the function
export -f claude-flow 2>/dev/null || true
