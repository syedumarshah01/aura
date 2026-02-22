const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const aiGenPath = path.join(__dirname, 'ai_worker.js');
const mongoPath = path.join(__dirname, 'db_worker.js');

const procFile = path.join(__dirname, 'data/ai_processed.jsonl');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(procFile)) fs.writeFileSync(procFile, '');

console.log("🚦 Initiating Concurrent Stage 2 (AI) & Stage 3 (DB) Pipeline Engines...");

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
    console.log("\nClosing active pipelines safely...");
    if (aiProcess && !aiProcess.killed) aiProcess.kill();
    if (dbProcess && !dbProcess.killed) dbProcess.kill();
    process.exit();
});
