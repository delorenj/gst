# GST - GitHub Gist Management Tool

A command-line tool for quickly fetching and copying files from your GitHub Gists. Available in multiple implementations: Bash, ZSH plugin, Python (Click), and TypeScript (oclif).

## Features

- 🔍 Search and filter GitHub gists
- 📁 Interactive file selection with fzf
- 📋 Copy content to clipboard or save to file
- 🖼️ Preview gist content before selection
- 🌍 Cross-platform clipboard support (wl-copy, xclip, pbcopy, clip)

## Prerequisites

All implementations require:
- `gh` (GitHub CLI) - [Install instructions](https://cli.github.com/)
- `fzf` - [Install instructions](https://github.com/junegunn/fzf)

## Usage

```bash
gst [<gist search>] [<filename>] [--clip] [<destination>]
```

### Arguments
- `<gist search>` - Optional search term to filter gists
- `<filename>` - Optional filename filter within selected gist
- `--clip` - Copy content to clipboard instead of stdout
- `<destination>` - Save content to specified file

### Examples

```bash
# Interactive gist and file selection
gst

# Search for gists containing "config"
gst config

# Search for "config" gists and filter for ".zshrc" files
gst config zshrc

# Copy file content to clipboard
gst config zshrc --clip

# Save file content to local file
gst config zshrc ~/.zshrc.backup
```

## Installation

### Bash

```bash
# Make executable
chmod +x ./bash/gst.sh

# Add to PATH or create alias
alias gst='~/path/to/gst/bash/gst.sh'
```

### ZSH Plugin

```bash
# Source in your .zshrc
source ~/path/to/gst/zsh/gst.plugin.zsh

# Or use with a plugin manager like oh-my-zsh
# Copy to: ~/.oh-my-zsh/custom/plugins/gst/
```

### Python (Click)

```bash
# Install dependencies
pip install click

# Make executable
chmod +x ./python/gst.py

# Create alias or symlink
alias gst='~/path/to/gst/python/gst.py'
# OR
ln -s ~/path/to/gst/python/gst.py ~/.local/bin/gst
```

### TypeScript (oclif)

```bash
cd ./typescript

# Install dependencies
pnpm install

# Build
pnpm run build

# Link globally
pnpm link --global

# Now use anywhere
gst
```

## Implementation Details

### Bash (`./bash/gst.sh`)
- Pure bash implementation
- Minimal dependencies
- Direct execution

### ZSH Plugin (`./zsh/gst.plugin.zsh`)
- ZSH-specific features
- Tab completion support
- Function-based implementation

### Python (`./python/gst.py`)
- Click framework for CLI
- Type hints for better IDE support
- Cross-platform compatibility

### TypeScript (`./typescript/`)
- oclif framework
- Full TypeScript support
- Extensible plugin architecture

## Troubleshooting

### "gh CLI required"
Install GitHub CLI from https://cli.github.com/

### "fzf required"
Install fzf from https://github.com/junegunn/fzf

### "No clipboard utility found"
Install one of the supported clipboard utilities:
- Linux (Wayland): `wl-copy` (part of wl-clipboard)
- Linux (X11): `xclip`
- macOS: `pbcopy` (pre-installed)
- Windows: `clip` (pre-installed)

### Authentication issues
Make sure you're authenticated with GitHub CLI:
```bash
gh auth login
```

## License

MIT
