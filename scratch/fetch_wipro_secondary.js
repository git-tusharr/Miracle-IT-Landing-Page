const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Wipro_Secondary_Logo_Color_RGB.svg';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('scratch/wipro_secondary.svg');
    res.pipe(file);
    file.on('finish', () => {
      console.log('Downloaded wipro_secondary.svg successfully');
    });
  } else {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', data.substring(0, 200)));
  }
}).on('error', err => console.error(err));
