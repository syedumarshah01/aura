require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./Product');

const PROCESSED_FILE = path.join(__dirname, 'data/ai_processed.jsonl');
const CURSOR_FILE = path.join(__dirname, 'data/db_cursor.txt');

if (!fs.existsSync(PROCESSED_FILE)) fs.writeFileSync(PROCESSED_FILE, '');
if (!fs.existsSync(CURSOR_FILE)) fs.writeFileSync(CURSOR_FILE, '0');

let lastProcessedIndex = parseInt(fs.readFileSync(CURSOR_FILE, 'utf-8'), 10) || 0;
console.log(`✅ Stage 3 Resumption State: Loaded Atlas Cursor at index ${lastProcessedIndex}.`);
let isProcessing = false;

async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const content = fs.readFileSync(PROCESSED_FILE, 'utf-8');
        const lines = content.split('\n');

        for (let i = lastProcessedIndex; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) {
                lastProcessedIndex = i + 1;
                continue;
            }

            let product;
            try {
                product = JSON.parse(line);
            } catch (e) {
                lastProcessedIndex = i + 1;
                continue;
            }

            console.log(`\n⏳ [Stage 3] Upserting to Atlas: ${product.title}`);
            try {
                await Product.updateOne(
                    { url: product.url },
                    { $set: product },
                    { upsert: true }
                );
                console.log(`✅ [Stage 3] Synchronized: ${product.url}`);
            } catch (dbErr) {
                console.error(`❌ [Stage 3] MongoDB Error:`, dbErr.message);
            }

            lastProcessedIndex = i + 1;
            fs.writeFileSync(CURSOR_FILE, lastProcessedIndex.toString());
        }

    } catch (err) {
        console.error("Stage 3 Processing Error:", err);
    }

    isProcessing = false;
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("🚀 Stage 3: Atlas Uploader Connected! Tailing ai_processed.jsonl...");
        setInterval(processQueue, 3000);
        processQueue();
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });
