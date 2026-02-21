const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scraperDir = path.join(__dirname, '../../scraper');
const scraperPath = path.join(scraperDir, 'scraper.py');
const pythonPath = path.join(scraperDir, 'venv', 'Scripts', 'python.exe');

const aiGenPath = path.join(__dirname, 'fillMissingData.js');
const mongoPath = path.join(__dirname, 'mongoUpload.js');

const rawFile = path.join(__dirname, '../data/scraped_raw.jsonl');
const procFile = path.join(__dirname, '../data/ai_processed.jsonl');

// Clear existing JSONL pipelines on fresh start to prevent duplicate uploads
if (fs.existsSync(rawFile)) fs.writeFileSync(rawFile, '');
if (fs.existsSync(procFile)) fs.writeFileSync(procFile, '');
console.log("🧹 Cleared old stream channels...");

console.log("🚦 Initiating Concurrent Stage 1-3 Pipeline Engines...");

// Stage 1: Scraper
const scraperProcess = spawn(pythonPath, [scraperPath], { cwd: scraperDir });
scraperProcess.stdout.on('data', data => process.stdout.write(`🔵 [Stage 1 - Extract]: ${data}`));
scraperProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 1 ERROR]: ${data}`));

// Stage 2: AI Generative Processor
const aiProcess = spawn('node', [aiGenPath], { cwd: __dirname });
aiProcess.stdout.on('data', data => process.stdout.write(`🟢 ${data}`));
aiProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 2 ERROR]: ${data}`));

// Stage 3: MongoDB Atlas Cloud Uploader
const dbProcess = spawn('node', [mongoPath], { cwd: __dirname });
dbProcess.stdout.on('data', data => process.stdout.write(`🟣 ${data}`));
dbProcess.stderr.on('data', data => process.stderr.write(`🛑 [Stage 3 ERROR]: ${data}`));

// Terminate safely on exit
process.on('SIGINT', () => {
    console.log("\nClosing all concurrent pipelines safely...");
    scraperProcess.kill();
    aiProcess.kill();
    dbProcess.kill();
    process.exit();
});
