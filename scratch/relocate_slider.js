const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const sliderStart = '          <!-- ====================================================================\r\n         PLACED STUDENTS FLOATING KINETIC SLIDER';
const sliderEnd = '          </div>\r\n\r\n          <!-- Dual-Track Infinite Kinetic Marquee';

const startIdx = content.indexOf(sliderStart);
const endIdx = content.indexOf(sliderEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Slider block not found!', {startIdx, endIdx});
  process.exit(1);
}

const cutEnd = endIdx + '          </div>\r\n'.length;
const sliderBlock = content.slice(startIdx, cutEnd).trim();

// Remove slider from proof section
content = content.slice(0, startIdx) + content.slice(cutEnd);

// Find hero close tag
const heroCloseTag = '    </div>\r\n\r\n    <!-- 3. Problem / Career Confusion Section -->';
const heroCloseIdx = content.indexOf(heroCloseTag);

if (heroCloseIdx === -1) {
  console.error('Hero close tag not found!');
  process.exit(1);
}

const insertionPoint = heroCloseIdx + '    </div>\r\n'.length;
const newSection = `
    <!-- 2.5 Verified Placed Students Showcase Slider -->
    <section class="placed-students-section" id="placed-students" aria-label="Verified Placed Students Showcase">
      <div class="container">
        ${sliderBlock}
      </div>
    </section>
`;

content = content.slice(0, insertionPoint) + newSection + content.slice(insertionPoint);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully relocated placed students slider directly below hero in index.html!');
