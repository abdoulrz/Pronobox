import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText));

  try {
    await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });
    
    // Fake login by setting localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('fallbackMode', 'true');
      localStorage.setItem('fallbackUser', JSON.stringify({
        id: '1', username: 'admin', email: 'admin@test.com', role: 'admin', isPro: true
      }));
    });
    
    // Go to admin
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (error) {
    console.log('Navigation error:', error.message);
  }
  
  await browser.close();
})();
