# Naheed.pk Concurrent Data Scraper Pipeline 🚀

This standalone streaming pipeline independently manages Playwright scraping, Gemini 2.5 Flash copy-writing metadata, and seamless MongoDB Atlas uploads concurrently.

## Table of Contents
1. [GCP / Linux Deployment](#gcp--linux-deployment)
2. [Environment Configuration](#environment-configuration)
3. [Running the Pipeline](#running-the-pipeline)

---

### GCP / Linux Deployment

To deploy this concurrent orchestrator on a clean Google Cloud Platform (Ubuntu/Debian) instance, open your SSH terminal and execute:

```bash
# 1. Update system dependencies
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Secure Python 3 environments & venv support
sudo apt install -y python3 python3-pip python3-venv

# 4. Clone or transfer this `pipeline` directory onto your instance.
# Navigate into the deployment folder:
cd pipeline

# 5. Connect and install all pipeline layers:
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 6. Install Chromium for Playwright automation Headless Scraping
playwright install chromium
playwright install-deps
```

### Environment Configuration

Ensure that your `pipeline/.env` matches the instance deployment securely:
```env
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?appName=Cluster0
MONGO_DB=naheed_db
MONGO_COLLECTION=products

CLOUDINARY_CLOUD_NAME=yourapiname
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_secret

GEMINI_API_KEY=AIzaSy...
```

### Running the Pipeline

Rather than firing the scripts sequentially, there is a dedicated orchestrator built securely to handle unified lifecycle streaming limits without overlapping DB conflicts.

To power up the Scraper, AI, and Atlas engines in absolute concurrency:
```bash
node start.js
```

**Note on Rate Limits:** The Gemini Stage 2 processor relies on the `GEMINI_API_KEY` free tier, which imposes a strict hard-limit of **15 requests per minute**. If the Python scraper dumps 100+ documents within 60 seconds into `scraped_raw.jsonl`, the Node.js Gemini stream will organically trigger `429 Too Many Requests` status codes and pause parsing explicitly for **60-second cooldown windows** before automatically resuming. This ensures zero data loss during high-speed cloud extractions.
