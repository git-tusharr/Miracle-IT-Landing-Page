const fs = require('fs');

// 1. Polish components/proof/proof.css
let proofCss = fs.readFileSync('components/proof/proof.css', 'utf8');

proofCss = proofCss.replace(
  /\.proof-student-name\s*\{[\s\S]*?color:\s*#FFFFFF;[\s\S]*?\}/,
  `.proof-student-name {
  font-size: 1.02rem;
  color: #0F172A !important;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
);

proofCss = proofCss.replace(
  /\.proof-student-company-pill\s*\{[\s\S]*?background:\s*rgba\(6,\s*182,\s*212,\s*0\.1\);[\s\S]*?border:\s*1px solid rgba\(6,\s*182,\s*212,\s*0\.28\);[\s\S]*?\}/,
  `.proof-student-company-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  background: #F1F5F9 !important;
  border: 1px solid #CBD5E1 !important;
  border-radius: var(--radius-full, 9999px);
  padding: 0.25rem 0.65rem;
  width: fit-content;
  max-width: 100%;
}`
);

proofCss = proofCss.replace(
  /\.proof-student-company\s*\{[\s\S]*?color:\s*#38BDF8;[\s\S]*?\}/,
  `.proof-student-company {
  color: #0284C7 !important;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
);

fs.writeFileSync('components/proof/proof.css', proofCss, 'utf8');
console.log('Polished proof.css');

// 2. Polish components/footer/footer.css
let footerCss = fs.readFileSync('components/footer/footer.css', 'utf8');

footerCss = footerCss.replace(
  /\.footer-heading\s*\{[\s\S]*?color:\s*#FFFFFF;[\s\S]*?\}/,
  `.footer-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0F172A !important;
  margin-bottom: 1.15rem;
  letter-spacing: -0.01em;
  position: relative;
}`
);

footerCss = footerCss.replace(
  /\.footer-nav a\s*\{[\s\S]*?color:\s*#94A3B8;[\s\S]*?\}/,
  `.footer-nav a {
  color: #475569 !important;
  text-decoration: none;
  font-size: 0.88rem;
  line-height: 1.45;
  transition: color 0.18s ease, transform 0.18s ease;
  display: inline-block;
}`
);

footerCss = footerCss.replace(
  /\.footer-social-heading\s*\{[\s\S]*?color:\s*#94A3B8;[\s\S]*?\}/,
  `.footer-social-heading {
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748B !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}`
);

footerCss = footerCss.replace(
  /\.footer-social-btn\s*\{[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.04\);[\s\S]*?\}/,
  `.footer-social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  color: #475569 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
  text-decoration: none;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  flex-shrink: 0;
}`
);

fs.writeFileSync('components/footer/footer.css', footerCss, 'utf8');
console.log('Polished footer.css');
