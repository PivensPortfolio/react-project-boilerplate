const { spawn } = require('child_process');

function runTestWithTimeout(testCommand, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${testCommand}`);
    
    const child = spawn('cmd', ['/c', testCommand], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let hasTimedOut = false;
    let hasWatchMessage = false;

    // Set up timeout
    const timeout = setTimeout(() => {
      hasTimedOut = true;
      console.log('\n⚠️  Test timeout reached, terminating process...');
      
      // Kill the process
      spawn('taskkill', ['/f', '/im', 'node.exe'], { stdio: 'inherit' });
      
      reject(new Error('Test timeout'));
    }, timeoutMs);

    // Handle stdout
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);

      // Check for the watch message
      if (chunk.includes('Tests failed. Watching for file changes...')) {
        hasWatchMessage = true;
        console.log('\n⚠️  Detected watch mode, terminating process...');
        
        // Kill the process
        spawn('taskkill', ['/f', '/im', 'node.exe'], { stdio: 'inherit' });
        
        clearTimeout(timeout);
        reject(new Error('Test entered watch mode'));
      }
    });

    // Handle stderr
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stderr.write(chunk);
    });

    // Handle process exit
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (hasTimedOut || hasWatchMessage) {
        return; // Already handled
      }

      if (code === 0) {
        console.log('\n✅ Tests completed successfully');
        resolve({ success: true, output, code });
      } else {
        console.log(`\n❌ Tests failed with exit code ${code}`);
        resolve({ success: false, output, code });
      }
    });

    // Handle errors
    child.on('error', (error) => {
      clearTimeout(timeout);
      console.error('\n❌ Error running tests:', error.message);
      reject(error);
    });
  });
}

// Export for use
module.exports = { runTestWithTimeout };

// If run directly
if (require.main === module) {
  const testCommand = process.argv[2];
  if (!testCommand) {
    console.error('Usage: node test-runner.cjs "test command"');
    process.exit(1);
  }

  runTestWithTimeout(testCommand)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test runner error:', error.message);
      process.exit(1);
    });
}