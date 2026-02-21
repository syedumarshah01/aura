const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scraperPath = path.join(__dirname, 'scraper.py');
// Detect OS environment to handle virtual environments on Linux vs Windows
const isWindows = process.platform === 'win32';
const pythonPath = isWindows ? path.join(__dirname, 'venv', 'Scripts', 'python.exe') : path.join(__dirname, 'venv', 'bin', 'python3');

const aiGenPath = path.join(__dirname, 'ai_worker.js');
const mongoPath = path.join(__dirname, 'db_worker.js');

const rawFile = path.join(__dirname, 'data/scraped_raw.jsonl');
const procFile = path.join(__dirname, 'data/ai_processed.jsonl');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));

if (fs.existsSync(rawFile)) fs.writeFileSync(rawFile, '');
if (fs.existsSync(procFile)) fs.writeFileSync(procFile, '');
console.log("🧹 Cleared old stream channels...");

console.log("🚦 Initiating Concurrent Stage 1-3 Pipeline Engines...");

const scraperProcess = spawn(pythonPath, ['-u', scraperPath], { cwd: __dirname });
scraperProcess.stdout.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.log(`🔵 ${l}`));
});
scraperProcess.stderr.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.error(`🔴 [Stage 1 ERROR]: ${l}`));
});

const aiProcess = spawn('node', [aiGenPath], { cwd: __dirname });
aiProcess.stdout.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.log(`🟢 ${l}`));
});
aiProcess.stderr.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.error(`🛑 [Stage 2 ERROR]: ${l}`));
});

const dbProcess = spawn('node', [mongoPath], { cwd: __dirname });
dbProcess.stdout.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.log(`🟣 ${l}`));
});
dbProcess.stderr.on('data', data => {
    data.toString().split('\n').filter(Boolean).forEach(l => console.error(`💥 [Stage 3 ERROR]: ${l}`));
});

process.on('SIGINT', () => {
    console.log("\nClosing all concurrent pipelines safely...");
    scraperProcess.kill();
    aiProcess.kill();
    dbProcess.kill();
    process.exit();
});
