const fs = require('fs');

// We can inspect the path commands in path1163:
// "M83.5 124.5h12v46.2h-12zm7.3-20.6c-3.7-1-7.5 1.2-8.5 4.9s1.2 7.5 4.9 8.5 7.5-1.2 8.5-4.9-1.2-7.6-4.9-8.5m41.8 67.8... M0 124.5h12l9.3 29.5 11-29.5h10.4L53.5 154l9.7-29.5h12l-15.7 46.2H48.4l-11-30.1-11.1 30.1H15z"

// Notice:
// 'w': M0 124.5 ... H15z -> x spans 0 to ~75.2, y spans 124.5 to 170.7
// 'i': M83.5 124.5 -> x spans 83.5 to 95.5, y spans 103.9 to 170.7
// 'p': m41.8 67.8 ... -> from 95.5 + ...: 'p' descender goes down to ~199.4
// 'r': 'r' x spans ~140.6 to 164.7
// 'o': 'o' x spans ~169.5 to 207, y spans 124.5 to 170.7

// In the current wipro.svg:
// viewBox="0 0 376.8 296.5"
// The width is 376.8, height is 296.5.
// The whole logo has aspect ratio 376.8 / 296.5 = 1.27.

console.log('Aspect ratio of current wipro:', 376.8 / 296.5);
console.log('When constrained to max-height 42px: width =', 42 * (376.8 / 296.5));
console.log('In accenture.svg: viewBox="0 0 163.4 43"');
console.log('Aspect ratio of accenture:', 163.4 / 43);
console.log('When constrained to max-width 130px: height =', 130 / (163.4 / 43));
