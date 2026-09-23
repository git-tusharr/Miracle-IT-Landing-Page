const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split(/\r?\n/);

// Regex for emojis: standard unicode emoji blocks
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

const emojiMatches = [];

lines.forEach((line, index) => {
  if (emojiRegex.test(line)) {
    emojiMatches.push({ line: index + 1, text: line.trim() });
  }
});

console.log(`Found ${emojiMatches.length} lines with emojis:`);
emojiMatches.forEach(m => console.log(`L${m.line}: ${m.text}`));
