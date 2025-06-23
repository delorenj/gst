#!/usr/bin/env zsh
# GitHub Gist Management Tool - ZSH Plugin
# Usage: gst [<gist search>] [<filename>] [--clip] [<destination>]

# Colors for output
typeset -g GST_RED=$'\033[0;31m'
typeset -g GST_GREEN=$'\033[0;32m'
typeset -g GST_YELLOW=$'\033[1;33m'
typeset -g GST_NC=$'\033[0m'

# Function to print colored output
gst_print_error() {
    echo "${GST_RED}Error: $1${GST_NC}" >&2
}

gst_print_success() {
    echo "${GST_GREEN}$1${GST_NC}"
}

gst_print_warning() {
    echo "${GST_YELLOW}$1${GST_NC}"
}

# Check for required dependencies
gst_check_dependencies() {
    local missing_deps=()
    
    if ! command -v gh &> /dev/null; then
        missing_deps+=("gh (GitHub CLI)")
    fi
    
    if ! command -v fzf &> /dev/null; then
        missing_deps+=("fzf")
    fi
    
    if (( ${#missing_deps[@]} != 0 )); then
        gst_print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep" >&2
        done
        echo "Please install the missing dependencies and try again." >&2
        return 1
    fi
}

# Detect available clipboard command
gst_detect_clipboard() {
    if command -v wl-copy &> /dev/null; then
        echo "wl-copy"
    elif command -v xclip &> /dev/null; then
        echo "xclip -selection clipboard"
    elif command -v pbcopy &> /dev/null; then
        echo "pbcopy"
    elif command -v clip &> /dev/null; then
        echo "clip"
    else
        echo ""
    fi
}

# Copy content to clipboard
gst_copy_to_clipboard() {
    local content="$1"
    local clipboard_cmd=$(gst_detect_clipboard)
    
    if [[ -z "$clipboard_cmd" ]]; then
        gst_print_error "No clipboard utility found. Install wl-copy, xclip, pbcopy, or clip."
        return 1
    fi
    
    echo -n "$content" | eval "$clipboard_cmd"
    gst_print_success "Content copied to clipboard!"
}

# List gists with optional search
gst_list_gists() {
    local search="${1:-}"
    
    if [[ -n "$search" ]]; then
        gh gist list --limit 100 | grep -i "$search" || {
            gst_print_error "No gists found matching '$search'"
            return 1
        }
    else
        gh gist list --limit 100
    fi
}

# Get files from a gist
gst_get_gist_files() {
    local gist_id="$1"
    gh api "gists/$gist_id" --jq '.files | keys[]'
}

# Get content of a gist file
gst_get_gist_content() {
    local gist_id="$1"
    local filename="$2"
    gh api "gists/$gist_id" --jq ".files[\"$filename\"].content"
}

# Main gst function
gst() {
    gst_check_dependencies || return 1
    
    local gist_search=""
    local filename_filter=""
    local use_clipboard=false
    local destination=""
    
    # Parse arguments
    while (( $# > 0 )); do
        case "$1" in
            --clip)
                use_clipboard=true
                shift
                ;;
            *)
                if [[ -z "$gist_search" ]]; then
                    gist_search="$1"
                elif [[ -z "$filename_filter" ]]; then
                    filename_filter="$1"
                elif [[ -z "$destination" ]]; then
                    destination="$1"
                else
                    gst_print_error "Too many arguments"
                    echo "Usage: gst [<gist search>] [<filename>] [--clip] [<destination>]" >&2
                    return 1
                fi
                shift
                ;;
        esac
    done
    
    # Select gist
    local selected_gist
    selected_gist=$(gst_list_gists "$gist_search" | fzf --ansi --no-multi --preview 'gh gist view {1}' --preview-window=right:60%:wrap)
    
    if [[ -z "$selected_gist" ]]; then
        gst_print_warning "No gist selected"
        return 0
    fi
    
    local gist_id
    gist_id=$(echo "$selected_gist" | awk '{print $1}')
    
    # Get list of files in the gist
    local files
    files=$(gst_get_gist_files "$gist_id")
    
    # Filter files if filename provided
    if [[ -n "$filename_filter" ]]; then
        files=$(echo "$files" | grep -i "$filename_filter" || echo "")
        if [[ -z "$files" ]]; then
            gst_print_error "No files found matching '$filename_filter'"
            return 1
        fi
    fi
    
    # Select file if multiple
    local selected_file
    if [[ "$(echo "$files" | wc -l)" -eq 1 ]]; then
        selected_file="$files"
    else
        selected_file=$(echo "$files" | fzf --ansi --no-multi --preview "gh api 'gists/$gist_id' --jq '.files[\"{}\"'].content")
        if [[ -z "$selected_file" ]]; then
            gst_print_warning "No file selected"
            return 0
        fi
    fi
    
    # Get file content
    local content
    content=$(gst_get_gist_content "$gist_id" "$selected_file")
    
    # Handle output
    if [[ "$use_clipboard" = true ]]; then
        gst_copy_to_clipboard "$content"
    elif [[ -n "$destination" ]]; then
        echo "$content" > "$destination"
        gst_print_success "Content saved to $destination"
    else
        echo "$content"
    fi
}

# Add completion for gst command
if [[ -n "$ZSH_VERSION" ]]; then
    compdef _gst gst 2>/dev/null || true
    
    _gst() {
        _arguments \
            '--clip[Copy content to clipboard]' \
            '1:gist search:->search' \
            '2:filename filter:->filename' \
            '3:destination file:_files'
    }
fi
