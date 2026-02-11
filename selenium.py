"""
Simple Selenium smoke test for the portfolio.

Prereqs:
- pip install selenium
- Download a WebDriver (e.g., ChromeDriver) that matches your browser version and ensure it's on PATH.

Usage:
- Serve the site locally (recommended): python -m http.server
- Then run: python selenium.py
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By

URL = "http://localhost:8000/index.html"  # Change if needed

def main():
    # Use Chrome; switch to Firefox if you prefer
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")  # comment out to see the browser
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(URL)
        time.sleep(1)

        # Check key sections exist
        ids = ["home", "about", "skills", "journey", "photo", "contact", "game"]
        for i in ids:
            el = driver.find_element(By.ID, i)
            assert el is not None, f"Missing section #{i}"

        # Toggle theme
        driver.find_element(By.ID, "themeToggle").click()
        time.sleep(0.3)

        # Mini game canvas visible
        canvas = driver.find_element(By.ID, "gameCanvas")
        assert canvas.is_displayed(), "Canvas not displayed"

        print("✅ Selenium smoke test passed.")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
