import asyncio
import json
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

has_cloudinary = False
if os.getenv("CLOUDINARY_URL") or (os.getenv("CLOUDINARY_CLOUD_NAME") and os.getenv("CLOUDINARY_API_KEY")):
    try:
        cloudinary.config(secure=True)
        has_cloudinary = True
    except Exception as e:
        print("Cloudinary config failed:", e)

BASE_URL = "https://www.naheed.pk"
CATEGORY_URL = f"{BASE_URL}/health-beauty"
CONCURRENCY = 5

async def extract_subcategories(page):
    print(f"Navigating to {CATEGORY_URL}...")
    await page.goto(CATEGORY_URL, timeout=60000, wait_until='domcontentloaded')
    await page.wait_for_timeout(2000)
    content = await page.content()
    soup = BeautifulSoup(content, 'html.parser')
    links = soup.find_all('a', href=True)
    subcat_links = set()
    for link in links:
        href = link.get('href', '')
        if 'health-beauty/' in href or ('health-beauty.html' not in href and 'health-beauty' in href):
            if '?' not in href:
                href = href if href.startswith('http') else f"{BASE_URL}{href}"
                if href != CATEGORY_URL: subcat_links.add(href)
    return list(subcat_links)

async def extract_product_links(page, subcategory_url):
    print(f"  Fetching products for {subcategory_url}...")
    try:
        await page.goto(subcategory_url, timeout=60000, wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        last_height = await page.evaluate("document.body.scrollHeight")
        empty_scrolls = 0

        while True:
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            await page.wait_for_timeout(2500)
            new_height = await page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                empty_scrolls += 1
                if empty_scrolls >= 3:
                    print("    End of subcategory reached.")
                    break
            else:
                empty_scrolls = 0
            last_height = new_height

        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')
        
        product_links = set()
        items = soup.find_all('li', class_='item product product-item')
        if not items:
            items = soup.find_all('a', class_='product-item-link')
            for item in items:
                href = item.get('href')
                if href: product_links.add(href)
        else:
            for item in items:
                link = item.find('a', class_='product-item-link')
                if link and link.get('href'):
                    product_links.add(link['href'])
        
        return list(product_links)
    except Exception as e:
        print(f"  Error fetching products for {subcategory_url}: {e}")
        return []

async def extract_product_details(context, product_url, subcategory_name, sem):
    async with sem:
        page = await context.new_page()
        try:
            await page.route("**/*.{png,jpg,jpeg,svg,gif,webp,css,woff,woff2,ttf}", lambda route: route.abort()) 
            await page.goto(product_url, timeout=60000, wait_until='domcontentloaded')
            await page.wait_for_timeout(2000)
            data = await page.evaluate('''() => {
                let res = { title: "", price: "", description: "", in_stock: false, highlights: [], images: [] };
                let t = document.querySelector('h1.page-title span');
                if(t) res.title = t.innerText.trim();
                else {
                    let meta_t = document.querySelector('meta[name="title"]');
                    if(meta_t) res.title = meta_t.content;
                }
                let p = document.querySelector('.price-wrapper .price');
                if(p) res.price = p.innerText.trim();
                else {
                     let meta_p = document.querySelector('meta[property="product:price:amount"]');
                     if(meta_p) res.price = "Rs. " + meta_p.content;
                }
                let st = document.querySelector('div.stock.available');
                if(st) res.in_stock = true;
                else {
                     let meta_st = document.querySelector('meta[property="product:availability"]');
                     if(meta_st && meta_st.content.toLowerCase().includes('instock')) res.in_stock = true;
                     let script_ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                                         .find(s => s.innerText.includes('InStock'));
                     if(script_ld) res.in_stock = true;
                }
                let d = document.querySelector('div.product.attribute.description .value');
                if(d) res.description = d.innerText.trim();
                document.querySelectorAll('div.product.attribute.overview .value li').forEach(li => res.highlights.push(li.innerText.trim()));
                let imgs = Array.from(document.querySelectorAll('img')).map(i => i.src)
                           .filter(src => src.includes('media.naheed.pk/catalog/product/cache') && !src.includes('placeholder'));
                res.images = [...new Set(imgs)];
                if(res.images.length === 0) {
                     let og = document.querySelector('meta[property="og:image"]');
                     if(og && !og.content.includes('placeholder')) res.images.push(og.content);
                }
                return res;
            }''')
            data['url'] = product_url
            data['subcategory'] = subcategory_name
            
            # Immediately stream output directly to avoid pipeline blocking
            new_imgs = [upload_to_cloudinary(img) for img in data['images']]
            data['images'] = new_imgs
            jsonl_path = os.path.join(os.path.dirname(__file__), 'data', 'scraped_raw.jsonl')
            with open(jsonl_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(data) + '\n')
                
            print(f"    Extracted & Streamed: {data['title'][:30]}...")
            return data
        except Exception as e:
            print(f"Error {product_url}: {e}")
            return None
        finally:
            await page.close()

def upload_to_cloudinary(image_url):
    if not has_cloudinary: return image_url
    try:
        resp = cloudinary.uploader.upload(image_url)
        return resp.get('secure_url', image_url)
    except Exception as e:
        return image_url

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        subcategories = await extract_subcategories(page)
        print(f"Total subcategories found: {len(subcategories)}")
        
        sem = asyncio.Semaphore(CONCURRENCY)
        
        for sub_url in subcategories:
            subcategory_name = sub_url.split('/')[-1].replace('.html', '').replace('-', ' ').title()
            product_links = await extract_product_links(page, sub_url)
            print(f" Found {len(product_links)} products to extract concurrently.")
            
            tasks = [extract_product_details(context, p_url, subcategory_name, sem) for p_url in product_links]
            await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
