#!/usr/bin/env node

// Claude-Flow TTY wrapper
// This creates a proper PTY environment for claude-flow to run in

const { spawn } = require('child_process');
const path = require('path');

// Function to run claude-flow with proper TTY
function runClaudeFlow() {
  const args = process.argv.slice(2);
  
  // Use Python to create a PTY
  const pythonScript = `
import pty
import os
import sys
import select
import termios
import tty

# Get the claude-flow command
claude_flow_cmd = ['claude-flow'] + ${JSON.stringify(args)}

# Create a pseudo-terminal
master, slave = pty.openpty()

# Fork the process
pid = os.fork()

if pid == 0:
    # Child process
    os.close(master)
    os.setsid()
    os.dup2(slave, 0)
    os.dup2(slave, 1)
    os.dup2(slave, 2)
    
    # Execute claude-flow
    os.execvp('claude-flow', claude_flow_cmd)
else:
    # Parent process
    os.close(slave)
    
    # Set stdin to raw mode if it's a TTY
    if sys.stdin.isatty():
        old_settings = termios.tcgetattr(sys.stdin)
        tty.setraw(sys.stdin)
    
    try:
        while True:
            # Check for data from master or stdin
            r, w, e = select.select([master, sys.stdin], [], [], 0.1)
            
            if master in r:
                data = os.read(master, 1024)
                if not data:
                    break
                sys.stdout.buffer.write(data)
                sys.stdout.flush()
            
            if sys.stdin in r:
                data = sys.stdin.buffer.read(1)
                if data:
                    os.write(master, data)
            
            # Check if child process has exited
            pid_result, status = os.waitpid(pid, os.WNOHANG)
            if pid_result != 0:
                break
                
    finally:
        # Restore terminal settings
        if sys.stdin.isatty():
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
        
        # Wait for child to complete
        os.waitpid(pid, 0)
`;

  // Run the Python script
  const python = spawn('python3', ['-c', pythonScript], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  python.on('error', (err) => {
    console.error('Failed to start Python PTY wrapper:', err);
    process.exit(1);
  });

  python.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Run it
runClaudeFlow();
