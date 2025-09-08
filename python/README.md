# gst - Python Implementation

GitHub Gist Management Tool - Python version

## Installation

### Using pipx (Recommended)

```bash
pipx install git+https://github.com/delorenj/gst.git#subdirectory=python
```

After installation, you can use:
```bash
gst
```

**Note**: If you have an existing `gst` command, you may need to remove it first:
```bash
rm ~/.local/bin/gst  # or wherever your existing gst is located
pipx uninstall gst   # if previously installed with pipx
pipx install git+https://github.com/delorenj/gst.git#subdirectory=python
```

### Using pip

```bash
pip install git+https://github.com/delorenj/gst.git#subdirectory=python
```

### Development Installation

```bash
cd python
uv sync
uv run gst
```

## Usage

```bash
# Interactive mode - select gist and file with fzf
gst

# Search for gist by description
gst "MCP Settings"

# Copy specific file to clipboard
gst "MCP Settings" mcp.json --clip

# Save to file
gst "MCP Settings" mcp.json ./destination.json
```

## Requirements

- Python 3.12+
- GitHub CLI (`gh`) - must be authenticated
- fzf - for fuzzy finding
- Clipboard tool (wl-copy, xclip, pbcopy, or clip)