import Parser from 'rss-parser';

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
  customFields: {
    item: ['media:content', 'enclosure', 'description']
  }
});

const urls = [
  'https://www.sports.fr/football/feed/',
  'https://www.football.fr/feed/',
  'https://www.onzemondial.com/rss.xml',
  'https://le10sport.com/flux/football'
];

async function testUrls() {
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`Success! Found ${feed.items.length} items.`);
      const item = feed.items[0];
      const hasImage = !!(item.enclosure?.url || item['media:content']?.['$']?.url || item.content?.includes('<img') || item.description?.includes('<img'));
      console.log(`Has image: ${hasImage}`);
      if (hasImage) {
        console.log('Sample image URL:', item.enclosure?.url || item['media:content']?.['$']?.url);
        return; // We found a winner!
      }
    } catch (e) {
      console.log(`Failed: ${e.message}`);
    }
  }
}
testUrls();
