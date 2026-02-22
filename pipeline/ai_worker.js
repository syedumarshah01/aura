const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, 'data/scraped_raw.jsonl');
const PROCESSED_FILE = path.join(__dirname, 'data/ai_processed.jsonl');
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:3b';

if (!fs.existsSync(RAW_FILE)) fs.writeFileSync(RAW_FILE, '');
if (!fs.existsSync(PROCESSED_FILE)) fs.writeFileSync(PROCESSED_FILE, '');

const processedUrls = new Set();
const pContent = fs.readFileSync(PROCESSED_FILE, 'utf-8');
pContent.split('\n').filter(Boolean).forEach(line => {
    try {
        const p = JSON.parse(line);
        if (p.url) processedUrls.add(p.url);
    } catch (e) { }
});

console.log(`✅ Stage 2 Resumption State: Loaded ${processedUrls.size} previously processed products.`);

let lastProcessedIndex = 0;
let isProcessing = false;

async function generateOllamaCopy(productTitle) {
    const systemPrompt = `You are a high-end luxury e-commerce copywriter writing for a premium cosmetics and beauty brand called Aura. 
Your goal is to write completely human-like, sensory, and appealing copy based ONLY on the product title provided. 
Do NOT use robotic AI jargon like "Elevate your routine", "Unlock", or "Discover the secret". Speak directly to the senses and benefits.

Product Title: "${productTitle}"

Output strictly valid JSON with exactly two fields. Do not include markdown formatting or extra text outside the JSON object.
1. "description": A 2-sentence sensory and premium description of the product.
2. "highlights": An array of 3 short, punchy benefit-driven feature strings.`;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: systemPrompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Scrub markdown codeblocks the 3B model might wrap around its JSON
        const rawText = data.response.replace(/```json/gi, '').replace(/```/g, '').trim();
        const generatedJSON = JSON.parse(rawText);

        if (generatedJSON.description && Array.isArray(generatedJSON.highlights)) {
            return generatedJSON;
        } else {
            throw new Error("Ollama returned invalid Schema");
        }
    } catch (error) {
        console.error(`❌ Ollama Generation Error for '${productTitle}':`, error.message);
        return null;
    }
}

async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const content = fs.readFileSync(RAW_FILE, 'utf-8');
        const lines = content.split('\n');

        for (let i = lastProcessedIndex; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let product;
            try {
                product = JSON.parse(line);
            } catch (e) {
                console.error(`❌ [Stage 2] Failed to parse line ${i}. Skipping.`);
                lastProcessedIndex = i + 1;
                continue;
            }

            if (processedUrls.has(product.url)) {
                lastProcessedIndex = i + 1;
                continue;
            }

            console.log(`\n⏳ [Stage 2] Requesting Local Ollama Copy for: ${product.title}`);

            const aiCopy = await generateOllamaCopy(product.title);

            if (aiCopy) {
                product.description = aiCopy.description;
                product.highlights = aiCopy.highlights;
                console.log(`✅ [Stage 2] Ollama JSON Attached: ${product.url}`);
            } else {
                console.log(`⚠️ Falling back to default copy for: ${product.url}`);
                product.description = "A quintessential addition to your daily routine, crafted with excellence to deliver unparalleled results.";
                product.highlights = ["Premium Quality", "Ethically Sourced", "Long-lasting Wear"];
            }

            fs.appendFileSync(PROCESSED_FILE, JSON.stringify(product) + '\n');
            processedUrls.add(product.url);
            lastProcessedIndex = i + 1;

            // Optional structural delay to prevent memory spike bursts during local inference
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    } catch (err) {
        console.error("Queue Processing Error:", err);
    }

    isProcessing = false;
}

console.log(`🚀 Stage 2: Independent Ollama (${OLLAMA_MODEL}) Processor started. Tailing scraped_raw.jsonl...`);

setInterval(processQueue, 3000);
processQueue();
