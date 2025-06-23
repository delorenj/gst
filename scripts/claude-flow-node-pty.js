#!/usr/bin/env node

// Claude-Flow Node.js wrapper with proper TTY handling
const { spawn } = require('child_process');
const pty = require('node-pty');
const os = require('os');

// Get claude-flow path
const claudeFlowPath = require('child_process')
  .execSync('which claude-flow', { encoding: 'utf8' })
  .trim();

// Get arguments
const args = process.argv.slice(2);

// Determine shell
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// Create PTY instance
const ptyProcess = pty.spawn(claudeFlowPath, args, {
  name: 'xterm-256color',
  cols: process.stdout.columns || 80,
  rows: process.stdout.rows || 24,
  cwd: process.cwd(),
  env: process.env
});

// Pipe PTY to stdout/stdin
ptyProcess.on('data', (data) => {
  process.stdout.write(data);
});

process.stdin.on('data', (data) => {
  ptyProcess.write(data);
});

// Handle resize
process.stdout.on('resize', () => {
  ptyProcess.resize(
    process.stdout.columns || 80,
    process.stdout.rows || 24
  );
});

// Handle exit
ptyProcess.on('exit', (code) => {
  process.exit(code);
});

// Set stdin to raw mode if possible
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}
