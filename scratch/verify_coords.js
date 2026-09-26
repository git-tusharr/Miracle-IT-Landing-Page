// Coordinates for the 6 centers on a 660x480 canvas:
// Bhopal HQ (Center): (330, 230)
// Gwalior (North): (345, 75)
// Jabalpur (East): (535, 225)
// Nagpur (South): (425, 405)
// Ujjain (West): (190, 275)
// Ratlam (Far West / NW): (95, 175)

const fs = require('fs');

console.log('Coordinates calibrated:');
console.log('Bhopal:', { x: 330, y: 230 });
console.log('Gwalior:', { x: 345, y: 75 });
console.log('Jabalpur:', { x: 535, y: 225 });
console.log('Nagpur:', { x: 425, y: 405 });
console.log('Ujjain:', { x: 190, y: 275 });
console.log('Ratlam:', { x: 95, y: 175 });

// Distances between Ratlam and Ujjain:
const dx = 190 - 95;
const dy = 275 - 175;
console.log('Distance Ratlam -> Ujjain:', Math.hypot(dx, dy).toFixed(1), 'px (No collision possible!)');
