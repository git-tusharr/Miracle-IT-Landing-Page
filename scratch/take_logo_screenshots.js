const puppeteer = require('puppeteer-core');
const path = require('path');

async function testScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });

  // 1. Header logo
  const headerLogoEl = await page.$('.brand-logo');
  if (headerLogoEl) {
    await headerLogoEl.screenshot({ path: path.join(__dirname, 'header_logo.png') });
  }

  // 2. Final CTA logo
  const ctaLogoEl = await page.$('.final-cta-logo-wrap');
  if (ctaLogoEl) {
    await ctaLogoEl.screenshot({ path: path.join(__dirname, 'cta_logo.png') });
  }

  // 3. Footer logo
  const footerLogoEl = await page.$('.footer-logo');
  if (footerLogoEl) {
    await footerLogoEl.screenshot({ path: path.join(__dirname, 'footer_logo.png') });
  }

  // 4. Full header bar screenshot
  const headerEl = await page.$('.site-header');
  if (headerEl) {
    await headerEl.screenshot({ path: path.join(__dirname, 'header_bar.png') });
  }

  // Computed styles of the logo elements
  const styles = await page.evaluate(() => {
    const hl = document.querySelector('.brand-logo');
    const cl = document.querySelector('.final-cta-logo-link');
    const fl = document.querySelector('.footer-logo-link');
    return {
      headerLogo: hl ? {
        bg: window.getComputedStyle(hl).backgroundColor,
        padding: window.getComputedStyle(hl).padding,
        border: window.getComputedStyle(hl).border
      } : null,
      ctaLogo: cl ? {
        bg: window.getComputedStyle(cl).backgroundColor,
        padding: window.getComputedStyle(cl).padding,
        border: window.getComputedStyle(cl).border
      } : null,
      footerLogo: fl ? {
        bg: window.getComputedStyle(fl).backgroundColor,
        padding: window.getComputedStyle(fl).padding,
        border: window.getComputedStyle(fl).border
      } : null,
    };
  });

  console.log('Computed styles:', JSON.stringify(styles, null, 2));

  await browser.close();
  console.log('Screenshots captured successfully');
}

testScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
