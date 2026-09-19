import os
import re
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()
scraper_key = os.getenv("SCRAPER_API_KEY", "")
jina_key = os.getenv("JINA_API_KEY", "")

queries = [
    "fortune sunflower oil 1l",
    "mysore sandal soap 125g",
    "tata tea gold 500g",
    "parachute coconut oil 500ml",
    "cadbury bournvita 500g",
    "nivea soft cream 100ml",
    "dettol handwash 1500ml",
    "nescafe classic coffee 100g"
]

print(f"Scraper key available: {bool(scraper_key)}, Jina key available: {bool(jina_key)}")

for q in queries[:4]:
    url = f"https://api.scraperapi.com?api_key={scraper_key}&url=https://www.amazon.in/s?k={urllib.parse.quote(q)}&country_code=in"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            found = re.findall(r'data-asin="([A-Z0-9]{10})"', html)
            asins = [a for a in found if a.startswith('B0')]
            print(f"Query '{q}': found {len(asins)} ASINs -> {asins[:3]}")
    except Exception as e:
        print(f"Query '{q}' failed: {e}")
