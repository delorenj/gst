# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# gst - GitHub Gist Management Tool

A command-line tool for quickly fetching, copying, and saving files from GitHub Gists. Available in multiple language implementations.

## Project Overview

gst is a CLI tool that makes GitHub Gists as easy to use as local files. It provides:
- 🚀 Fuzzy search for gists and files with fzf
- 📋 Copy gist contents to clipboard (cross-platform)
- 💾 Save gist files directly to disk
- 🔍 Seamless integration with GitHub CLI

## Build Commands

### TypeScript Implementation (typescript/)
- `npm run build`: Build the TypeScript project
- `npm run test`: Run tests with Mocha
- `npm run lint`: Run ESLint
- `npm run clean`: Clean build artifacts

### Python Implementation (python/)
- Uses uv for dependency management
- Dependencies: click

## Project Structure

```
gst/
├── bash/               # Bash implementation
│   └── gst.sh         # Main bash script
├── python/            # Python implementation
│   ├── gst.py        # Python gst implementation
│   ├── main.py       # Entry point
│   └── pyproject.toml # Python project config
├── typescript/        # TypeScript implementation
│   ├── src/          # Source files
│   ├── bin/          # Executable scripts
│   └── package.json  # Node.js project config
└── zsh/              # Zsh plugin
    └── gst.plugin.zsh # Zsh plugin file
```

## Code Style Guidelines

### General
- Keep implementations consistent across languages
- Maintain cross-platform compatibility
- Focus on simplicity and performance
- Use meaningful variable and function names

### TypeScript
- Use ES modules (import/export)
- Use TypeScript strict mode
- Follow oclif conventions for CLI commands
- Add JSDoc comments for public APIs
- Use async/await over Promise chains

### Python
- Follow PEP 8 style guide
- Use type hints where applicable
- Use click for CLI interface
- Target Python 3.12+

### Shell Scripts
- Use shellcheck for validation
- Follow POSIX compatibility where possible
- Add error handling with set -e
- Use meaningful function names

## Usage Patterns

### Basic Commands
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

## Dependencies

### Required
- GitHub CLI (`gh`) - must be authenticated
- fzf - for fuzzy finding
- Clipboard tool:
  - Linux: wl-copy (Wayland) or xclip/xsel (X11)
  - macOS: pbcopy
  - Windows/WSL: clip

## Development Guidelines

1. **Multi-language Support**: Maintain feature parity across all implementations
2. **Error Handling**: Provide clear error messages for missing dependencies
3. **Performance**: Optimize for quick gist retrieval and selection
4. **Testing**: Add tests for new features (especially in TypeScript version)
5. **Documentation**: Update README when adding new features

## Important Notes

- The tool relies on `gh` CLI for GitHub authentication
- All implementations should support the same command-line interface
- Cross-platform clipboard support is essential
- Performance is key - users expect instant gist access
