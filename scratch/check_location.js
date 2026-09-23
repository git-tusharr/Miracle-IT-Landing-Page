const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startTag = '<div data-component="location">';
const nextTag = '<div data-component="faq">';

const startIdx = html.indexOf(startTag);
const endIdx = html.indexOf(nextTag);

console.log('Location in index.html starts at', startIdx, 'and faq starts at', endIdx);
const locationChunk = html.substring(startIdx, endIdx);
console.log('Location chunk first 300 chars:', locationChunk.substring(0, 300));
console.log('Location chunk last 300 chars:', locationChunk.substring(locationChunk.length - 300));
