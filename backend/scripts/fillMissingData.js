require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RAW_FILE = path.join(__dirname, '../data/scraped_raw.jsonl');
const PROCESSED_FILE = path.join(__dirname, '../data/ai_processed.jsonl');

// Ensure files exist
if (!fs.existsSync(RAW_FILE)) fs.writeFileSync(RAW_FILE, '');
if (!fs.existsSync(PROCESSED_FILE)) fs.writeFileSync(PROCESSED_FILE, '');

let lastProcessedIndex = 0;
let isProcessing = false;

async function fileToGenerativePart(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: response.headers.get('content-type') || 'image/jpeg'
            }
        };
    } catch (err) {
        console.error(`Error fetching image from ${url}:`, err);
        return null;
    }
}

async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const content = fs.readFileSync(RAW_FILE, 'utf-8');
        const lines = content.split('\n');

        // Use model outside loop
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // We iterate up to lines.length - 1 to ensure we only process complete lines (assuming trailing newlines)
        for (let i = lastProcessedIndex; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let product;
            try {
                product = JSON.parse(line);
            } catch (e) {
                continue; // Ignore malformed JSON lines
            }

            console.log(`\n⏳ [Stage 2] Generating AI data for: ${product.title}`);

            const prompt = `You are an expert e-commerce copywriter. Based on the product title and image provided, generate a compelling, premium e-commerce product description (3-4 sentences maximum) and a list of 3-5 key feature highlights. 
Product Title: "${product.title}"

Return ONLY a strictly valid JSON object with exactly these two keys: 
"description" (String)
"highlights" (Array of Strings).`;

            let imagePart = null;
            if (product.images && product.images.length > 0) {
                imagePart = await fileToGenerativePart(product.images[0]);
            }

            if (imagePart) {
                let retry = true;
                while (retry) {
                    try {
                        const result = await model.generateContent([prompt, imagePart]);
                        const responseText = result.response.text();
                        const generatedData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

                        if (generatedData.description && Array.isArray(generatedData.highlights)) {
                            product.description = generatedData.description;
                            product.highlights = generatedData.highlights;
                            console.log(`✅ [Stage 2] AI Copy Attached: ${product.url}`);
                        }
                        retry = false;
                    } catch (genErr) {
                        if (genErr.message.includes('429')) {
                            console.log(`\n⏳ Rate limit hit (429). Pausing for 60 seconds...`);
                            await new Promise(resolve => setTimeout(resolve, 60000));
                        } else {
                            console.error(`❌ Error generating content:`, genErr.message);
                            retry = false;
                        }
                    }
                }
            } else {
                console.log(`⚠️ Skipping image generation, missing valid image for: ${product.url}`);
            }

            // Append explicitly to next stage stream
            fs.appendFileSync(PROCESSED_FILE, JSON.stringify(product) + '\n');
            lastProcessedIndex = i + 1; // Mark successfully processed

            // 4-second delay for API quota management
            await new Promise(resolve => setTimeout(resolve, 4000));
        }

    } catch (err) {
        console.error("Queue Processing Error:", err);
    }

    isProcessing = false;
}

console.log("🚀 Stage 2: AI Processor started. Tailing scraped_raw.jsonl...");

// Process periodically
setInterval(processQueue, 3000);
processQueue();
