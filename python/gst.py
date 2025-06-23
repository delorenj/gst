#!/usr/bin/env python3

"""
GitHub Gist Management Tool
Usage: gst [<gist search>] [<filename>] [--clip] [<destination>]
"""

import subprocess
import sys
import shutil
import json
from typing import Optional, List, Dict, Any
import click
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'  # No Color


def print_error(message: str) -> None:
    """Print error message in red"""
    click.echo(f"{Colors.RED}Error: {message}{Colors.NC}", err=True)


def print_success(message: str) -> None:
    """Print success message in green"""
    click.echo(f"{Colors.GREEN}{message}{Colors.NC}")


def print_warning(message: str) -> None:
    """Print warning message in yellow"""
    click.echo(f"{Colors.YELLOW}{message}{Colors.NC}")


def check_dependencies() -> None:
    """Check for required dependencies"""
    missing_deps = []
    
    if not shutil.which('gh'):
        missing_deps.append('gh (GitHub CLI)')
    
    if not shutil.which('fzf'):
        missing_deps.append('fzf')
    
    if missing_deps:
        print_error("Missing required dependencies:")
        for dep in missing_deps:
            click.echo(f"  - {dep}", err=True)
        click.echo("Please install the missing dependencies and try again.", err=True)
        sys.exit(1)


def detect_clipboard() -> Optional[str]:
    """Detect available clipboard command"""
    clipboard_commands = [
        ('wl-copy', 'wl-copy'),
        ('xclip', 'xclip -selection clipboard'),
        ('pbcopy', 'pbcopy'),
        ('clip', 'clip')
    ]
    
    for cmd, full_cmd in clipboard_commands:
        if shutil.which(cmd):
            return full_cmd
    
    return None


def copy_to_clipboard(content: str) -> bool:
    """Copy content to clipboard"""
    clipboard_cmd = detect_clipboard()
    
    if not clipboard_cmd:
        print_error("No clipboard utility found. Install wl-copy, xclip, pbcopy, or clip.")
        return False
    
    try:
        subprocess.run(clipboard_cmd.split(), input=content.encode(), check=True)
        print_success("Content copied to clipboard!")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to copy to clipboard")
        return False


def run_command(cmd: List[str], capture_output: bool = True) -> subprocess.CompletedProcess:
    """Run a command and return the result"""
    return subprocess.run(cmd, capture_output=capture_output, text=True, check=True)


def list_gists(search: Optional[str] = None) -> str:
    """List gists with optional search"""
    try:
        result = run_command(['gh', 'gist', 'list', '--limit', '100'])
        
        if search:
            lines = [line for line in result.stdout.splitlines() 
                    if search.lower() in line.lower()]
            if not lines:
                print_error(f"No gists found matching '{search}'")
                sys.exit(1)
            return '\n'.join(lines)
        
        return result.stdout
    except subprocess.CalledProcessError:
        print_error("Failed to list gists")
        sys.exit(1)


def select_with_fzf(items: str, preview_cmd: Optional[str] = None) -> Optional[str]:
    """Use fzf to select from items"""
    cmd = ['fzf', '--ansi', '--no-multi']
    if preview_cmd:
        cmd.extend(['--preview', preview_cmd, '--preview-window=right:60%:wrap'])
    
    try:
        result = subprocess.run(cmd, input=items, capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except subprocess.CalledProcessError:
        return None


def get_gist_data(gist_id: str) -> Dict[str, Any]:
    """Get gist data using GitHub API"""
    try:
        result = run_command(['gh', 'api', f'gists/{gist_id}'])
        return json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError):
        print_error(f"Failed to get gist data for {gist_id}")
        sys.exit(1)


def get_gist_files(gist_id: str) -> List[str]:
    """Get list of files in a gist"""
    data = get_gist_data(gist_id)
    return list(data.get('files', {}).keys())


def get_gist_content(gist_id: str, filename: str) -> str:
    """Get content of a gist file"""
    data = get_gist_data(gist_id)
    files = data.get('files', {})
    
    if filename not in files:
        print_error(f"File '{filename}' not found in gist")
        sys.exit(1)
    
    return files[filename].get('content', '')


@click.command()
@click.argument('gist_search', required=False, default='')
@click.argument('filename', required=False, default='')
@click.argument('destination', required=False, default='')
@click.option('--clip', is_flag=True, help='Copy content to clipboard')
def main(gist_search: str, filename: str, destination: str, clip: bool) -> None:
    """GitHub Gist Management Tool
    
    Usage: gst [<gist search>] [<filename>] [--clip] [<destination>]
    """
    check_dependencies()
    
    # List and select gist
    gists = list_gists(gist_search)
    selected_gist = select_with_fzf(gists, 'gh gist view {1}')
    
    if not selected_gist:
        print_warning("No gist selected")
        return
    
    # Extract gist ID
    gist_id = selected_gist.split()[0]
    
    # Get list of files
    files = get_gist_files(gist_id)
    
    # Filter files if filename provided
    if filename:
        files = [f for f in files if filename.lower() in f.lower()]
        if not files:
            print_error(f"No files found matching '{filename}'")
            sys.exit(1)
    
    # Select file
    if len(files) == 1:
        selected_file = files[0]
    else:
        files_str = '\n'.join(files)
        preview_cmd = f"gh api 'gists/{gist_id}' --jq '.files[\"{{}}\"]'.content"
        selected_file = select_with_fzf(files_str, preview_cmd)
        
        if not selected_file:
            print_warning("No file selected")
            return
    
    # Get file content
    content = get_gist_content(gist_id, selected_file)
    
    # Handle output
    if clip:
        copy_to_clipboard(content)
    elif destination:
        Path(destination).write_text(content)
        print_success(f"Content saved to {destination}")
    else:
        click.echo(content)


if __name__ == '__main__':
    main()
