const fs = require('fs');

// 1. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
const oldH3 = '<h3>Not sure which course fits your background?</h3>';
const newH3 = '<h3 style="color: #FFFFFF !important;">Not sure which course fits your background?</h3>';
const oldP = '<p>That is exactly what the free counselling session is for.';
const newP = '<p style="color: #E2E8F0 !important;">That is exactly what the free counselling session is for.';

if (indexHtml.includes(oldH3)) {
  indexHtml = indexHtml.replace(oldH3, newH3);
  console.log('Replaced H3 in index.html');
}
if (indexHtml.includes(oldP)) {
  indexHtml = indexHtml.replace(oldP, newP);
  console.log('Replaced P in index.html');
}
fs.writeFileSync('index.html', indexHtml, 'utf8');

// 2. Check miracle-it-career-academy/index.html if exists
if (fs.existsSync('miracle-it-career-academy/index.html')) {
  let subIndex = fs.readFileSync('miracle-it-career-academy/index.html', 'utf8');
  if (subIndex.includes(oldH3)) subIndex = subIndex.replace(oldH3, newH3);
  if (subIndex.includes(oldP)) subIndex = subIndex.replace(oldP, newP);
  fs.writeFileSync('miracle-it-career-academy/index.html', subIndex, 'utf8');
}
if (fs.existsSync('miracle-it-career-academy/components/who-can-join/who-can-join.html')) {
  let subWho = fs.readFileSync('miracle-it-career-academy/components/who-can-join/who-can-join.html', 'utf8');
  if (subWho.includes(oldH3)) subWho = subWho.replace(oldH3, newH3);
  if (subWho.includes(oldP)) subWho = subWho.replace(oldP, newP);
  fs.writeFileSync('miracle-it-career-academy/components/who-can-join/who-can-join.html', subWho, 'utf8');
}

console.log('Done fixing who-cta text styling');
