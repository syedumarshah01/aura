require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const PROCESSED_FILE = path.join(__dirname, '../data/ai_processed.jsonl');
if (!fs.existsSync(PROCESSED_FILE)) fs.writeFileSync(PROCESSED_FILE, '');

let lastProcessedIndex = 0;
let isProcessing = false;

async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const content = fs.readFileSync(PROCESSED_FILE, 'utf-8');
        const lines = content.split('\n');

        // Iterate up to lines.length - 1
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
        }

    } catch (err) {
        console.error("Stage 3 Processing Error:", err);
    }

    isProcessing = false;
}

// Initialize Connection and start daemon
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
