const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scraperPath = path.join(__dirname, 'scraper.py');
const pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');

const aiGenPath = path.join(__dirname, 'ai_worker.js');
const mongoPath = path.join(__dirname, 'db_worker.js');

const rawFile = path.join(__dirname, 'data/scraped_raw.jsonl');
const procFile = path.join(__dirname, 'data/ai_processed.jsonl');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));

if (fs.existsSync(rawFile)) fs.writeFileSync(rawFile, '');
if (fs.existsSync(procFile)) fs.writeFileSync(procFile, '');
console.log("🧹 Cleared old stream channels...");

console.log("🚦 Initiating Concurrent Stage 1-3 Pipeline Engines...");

const scraperProcess = spawn(pythonPath, [scraperPath], { cwd: __dirname });
scraperProcess.stdout.on('data', data => process.stdout.write(`🔵 [Stage 1 - Extract]: ${data}`));
scraperProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 1 ERROR]: ${data}`));

const aiProcess = spawn('node', [aiGenPath], { cwd: __dirname });
aiProcess.stdout.on('data', data => process.stdout.write(`🟢 ${data}`));
aiProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 2 ERROR]: ${data}`));

const dbProcess = spawn('node', [mongoPath], { cwd: __dirname });
dbProcess.stdout.on('data', data => process.stdout.write(`🟣 ${data}`));
dbProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 3 ERROR]: ${data}`));

process.on('SIGINT', () => {
    console.log("\nClosing all concurrent pipelines safely...");
    scraperProcess.kill();
    aiProcess.kill();
    dbProcess.kill();
    process.exit();
});
