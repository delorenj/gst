# gst 🦑

A power tool for quickly fetching, copying, and saving files from your GitHub Gists, right from the command line.

- 🚀 **Fuzzy search** your gists and files with [fzf](https://github.com/junegunn/fzf)
- 📋 **Copy** gist file contents straight to your clipboard (supports Linux, macOS, and WSL/Windows)
- 💾 **Save** gist file contents directly to a local file
- 🔍 **Works with [GitHub CLI](https://cli.github.com/)** for seamless authentication and gist management

## Why?

If you use GitHub Gists as a snippet manager, config backup, or code vault, you know the pain of finding and copying files quickly—especially from the terminal. `gst` makes your gists as easy to use as local files!

## Features

- Interactive selection of gists and files with `fzf`
- Output to clipboard (auto-detects `wl-copy`, `xclip`, `pbcopy`, or `clip`)
- Save to any destination on disk
- Flexible: search by description, filename, or use pure interactive mode
- Cross-platform (Linux, macOS, Windows with WSL)

## Installation

### Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) (must be authenticated: `gh auth login`)
- [fzf](https://github.com/junegunn/fzf)
- A clipboard tool:
  - Linux: `wl-copy` (Wayland), `xclip` or `xsel` (X11)
  - macOS: `pbcopy`
  - Windows/WSL: `clip`

### Download

1. Copy `gst` to a directory in your `$PATH`:
   ```sh
   curl -o /usr/local/bin/gst https://raw.githubusercontent.com/delorenj/zshyzsh/main/gst
   chmod +x /usr/local/bin/gst
   ```
2. Or clone this repo and symlink `gst`:
   ```sh
   git clone https://github.com/delorenj/zshyzsh.git
   cd zshyzsh
   chmod +x gst
   ln -s "$PWD/gst" ~/bin/gst  # or wherever is in your $PATH
   ```

## Usage

```sh
gst [<gist search>] [<filename>] [--clip] [<destination>]
```

**Examples:**

- **Interactive mode** (pick gist and file with fzf):
  ```sh
  gst
  ```
- **Fuzzy search for gist, pick file interactively:**
  ```sh
  gst "MCP Settings"
  ```
- **Fetch specific file, output to clipboard:**
  ```sh
  gst "MCP Settings" mcp.json --clip
  ```
- **Save gist file to disk:**
  ```sh
  gst "MCP Settings" mcp.json ./some/destination.json
  ```

No arguments? `gst` will guide you with interactive selection!

### Options

- `<gist search>`: Fuzzy match against gist descriptions/titles.
- `<filename>`: File to fetch from the gist (optional, will prompt if omitted).
- `--clip`: Copy the output directly to your clipboard.
- `<destination>`: Output file path (optional).

## Clipboard Support

- **Linux (Wayland):** [wl-clipboard](https://github.com/bugaevc/wl-clipboard)
- **Linux (X11):** [xclip](https://github.com/astrand/xclip) or [xsel](https://github.com/kfish/xsel)
- **macOS:** Built-in `pbcopy`
- **Windows (WSL):** Built-in `clip`

## How it Works

- Lists your gists using the `gh` CLI
- Fuzzy-finds the gist and file you want
- Streams the file content to stdout, clipboard, or disk

## Contributing

Open source and open to contributions! Please file issues, fork, and submit pull requests for enhancements, bug fixes, or new features.

- Follow shell best practices
- Keep UX simple and fast
- Cross-platform compatibility is a plus!

## License

MIT License

---

Made with ☕ by [@delorenj](https://github.com/delorenj).
