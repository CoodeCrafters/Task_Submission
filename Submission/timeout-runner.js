// timeout-runner.js
const { spawn } = require('child_process');

const timeout = 5 * 60 * 1000; // 5 minutes in milliseconds (change as needed)
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

const timer = setTimeout(() => {
    console.log(`⏱️ Timeout reached! Killing server after ${timeout / 1000} seconds.`);
    server.kill();
    process.exit();
}, timeout);

server.on('exit', (code) => {
    clearTimeout(timer);
    console.log(`Server exited with code ${code}`);
});
