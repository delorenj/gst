#!/usr/bin/env bash
# gst: Quickly fetch and copy files from your GitHub Gists

set -e

# Check dependencies
command -v gh >/dev/null 2>&1 || {
  echo "gh CLI required. Install from https://cli.github.com/"
  exit 1
}
command -v fzf >/dev/null 2>&1 || {
  echo "fzf required. Install from https://github.com/junegunn/fzf"
  exit 1
}

# Clipboard detection
copy_clipboard() {
  if command -v wl-copy >/dev/null 2>&1; then
    wl-copy
  elif command -v xclip >/dev/null 2>&1; then
    xclip -sel clip
  elif command -v pbcopy >/dev/null 2>&1; then
    pbcopy
  elif command -v clip >/dev/null 2>&1; then
    clip
  else
    echo "No clipboard utility found (wl-copy, xclip, pbcopy, clip)."
    exit 1
  fi
}

usage() {
  echo "Usage: gst [<gist search>] [<filename>] [--clip] [<destination>]"
  echo "  - If no args, select gist and file interactively."
  echo "  - <gist search> : Fuzzy search for gist (partial description)."
  echo "  - <filename>    : File to select from the gist (optional; fuzzy if omitted)."
  echo "  - --clip        : Copy to clipboard instead of stdout/file."
  echo "  - <destination> : Save to file if provided."
  exit 1
}

# Parse args
SEARCH=""
FILENAME=""
DEST=""
CLIP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
  --clip)
    CLIP=true
    shift
    ;;
  *)
    if [[ -z "$SEARCH" ]]; then
      SEARCH="$1"
    elif [[ -z "$FILENAME" ]]; then
      FILENAME="$1"
    elif [[ -z "$DEST" ]]; then
      DEST="$1"
    else
      usage
    fi
    shift
    ;;
  esac
done

# 1. Select gist
if [[ -z "$SEARCH" ]]; then
  # No search term: fzf select gist
  GIST_LINE=$(gh gist list --limit 100 | fzf --prompt="Select Gist: ")
else
  # Search for gist
  GIST_LINE=$(gh gist list --limit 100 | grep -i "$SEARCH" | fzf --prompt="Select Gist: ")
fi

[[ -z "$GIST_LINE" ]] && {
  echo "No gist selected."
  exit 1
}
GIST_ID=$(awk '{print $1}' <<<"$GIST_LINE")

# 2. Select file in gist
FILES=$(gh gist view "$GIST_ID" --files | tail -n +2)
if [[ -z "$FILENAME" ]]; then
  FILE=$(echo "$FILES" | fzf --prompt="Select File: ")
  [[ -z "$FILE" ]] && {
    echo "No file selected."
    exit 1
  }
else
  FILE=$(echo "$FILES" | grep -F "$FILENAME" | head -n 1)
  [[ -z "$FILE" ]] && {
    echo "File '$FILENAME' not found in gist."
    exit 1
  }
fi

# 3. Output
if [[ "$CLIP" == true ]]; then
  gh gist view "$GIST_ID" --raw --filename "$FILE" | copy_clipboard
elif [[ -n "$DEST" ]]; then
  gh gist view "$GIST_ID" --raw --filename "$FILE" >"$DEST"
  echo "Saved to $DEST"
else
  gh gist view "$GIST_ID" --raw --filename "$FILE"
fi
