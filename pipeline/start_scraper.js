const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scraperPath = path.join(__dirname, 'scraper.py');
// Detect OS environment to handle virtual environments on Linux vs Windows
const isWindows = process.platform === 'win32';
const pythonPath = isWindows ? path.join(__dirname, 'venv', 'Scripts', 'python.exe') : path.join(__dirname, 'venv', 'bin', 'python3');

const rawFile = path.join(__dirname, 'data/scraped_raw.jsonl');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(rawFile)) fs.writeFileSync(rawFile, '');

console.log("🚦 Initiating Stage 1 (Extractor) Engine...");

const scraperProcess = spawn(pythonPath, ['-u', scraperPath], { cwd: __dirname });

scraperProcess.stdout.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.log(`🔵 ${l}`));
});
scraperProcess.stderr.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.error(`🔴 [Stage 1 ERROR]: ${l}`));
});

scraperProcess.on('close', (code) => {
    console.log(`\n✅ Stage 1 completely finished with exit code ${code}.`);
    console.log(`\n➡️ You can now run "node start_workers.js" to process and upload the data.`);
});

process.on('SIGINT', () => {
    console.log("\nClosing scraper pipeline safely...");
    if (scraperProcess && !scraperProcess.killed) scraperProcess.kill();
    process.exit();
});
