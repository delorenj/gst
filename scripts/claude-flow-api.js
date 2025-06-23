#!/usr/bin/env node
// Direct claude-flow API usage to bypass TTY issues

const path = require('path');
const fs = require('fs');

// Try to find and load claude-flow as a module
async function runClaudeFlowSwarm() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args[0] !== 'swarm') {
      console.error('This wrapper currently only supports the swarm command');
      process.exit(1);
    }
    
    // Parse the swarm command
    const objective = args[1];
    const options = {};
    
    // Parse options
    for (let i = 2; i < args.length; i += 2) {
      const key = args[i].replace('--', '');
      const value = args[i + 1];
      options[key] = value;
    }
    
    console.log('🚀 Running claude-flow swarm via API...');
    console.log('📋 Objective:', objective);
    console.log('⚙️  Options:', options);
    
    // Try to load claude-flow module
    const claudeFlowPath = '/home/delorenj/.local/share/mise/installs/node/24.1.0/lib/node_modules/claude-flow';
    
    // Check if we can find the swarm implementation
    const possiblePaths = [
      path.join(claudeFlowPath, 'dist', 'commands', 'swarm.js'),
      path.join(claudeFlowPath, 'dist', 'cli', 'commands', 'swarm.js'),
      path.join(claudeFlowPath, 'src', 'commands', 'swarm.ts'),
      path.join(claudeFlowPath, 'src', 'cli', 'commands', 'swarm.ts'),
    ];
    
    console.log('\n🔍 Searching for swarm implementation...');
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log('✅ Found:', p);
        
        // Try to load and execute
        try {
          const swarmModule = require(p);
          console.log('📦 Module loaded:', Object.keys(swarmModule));
          
          // Look for a run or execute function
          if (swarmModule.run) {
            await swarmModule.run(objective, options);
          } else if (swarmModule.execute) {
            await swarmModule.execute(objective, options);
          } else if (swarmModule.default) {
            await swarmModule.default(objective, options);
          } else {
            console.error('❌ Could not find execution method in module');
          }
        } catch (loadError) {
          console.error('❌ Error loading module:', loadError.message);
        }
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run it
runClaudeFlowSwarm();
