const fs = require('fs');
const path = require('path');

const faqPath = path.resolve(__dirname, '../components/faq/faq.css');
let css = fs.readFileSync(faqPath, 'utf-8');

// Replace light colors with dark slate colors
css = css.replace(/background-color:\s*#F8FAFC\s*!important;[\r\n\s]*color:\s*#0F172A\s*!important;/g,
  'background-color: #0A1020 !important;\n  color: #F8FAFC !important;');

css = css.replace(/\.faq-main-heading\s*\{[\s\S]*?color:\s*#0F172A\s*!important;/g, (m) => {
  return m.replace('#0F172A', '#FFFFFF');
});

css = css.replace(/\.faq-main-subheading\s*\{[\s\S]*?color:\s*#475569\s*!important;/g, (m) => {
  return m.replace('#475569', '#94A3B8');
});

// Search input
css = css.replace(/\.faq-search-input\s*\{[\s\S]*?background:\s*#FFFFFF\s*!important;[\s\S]*?border:\s*1\.5px solid #CBD5E1\s*!important;[\s\S]*?color:\s*#0F172A\s*!important;/g,
  (m) => {
    return m.replace('#FFFFFF', 'rgba(15, 23, 42, 0.8)')
            .replace('#CBD5E1', 'rgba(255, 255, 255, 0.12)')
            .replace('#0F172A', '#FFFFFF');
  });

// Filter tabs
css = css.replace(/\.faq-tab-btn\s*\{[\s\S]*?background:\s*#FFFFFF;[\s\S]*?border:\s*1\.5px solid #E2E8F0;[\s\S]*?color:\s*#475569;/g,
  (m) => {
    return m.replace('#FFFFFF', 'rgba(15, 23, 42, 0.7)')
            .replace('#E2E8F0', 'rgba(255, 255, 255, 0.1)')
            .replace('#475569', '#94A3B8');
  });

css = css.replace(/\.faq-tab-btn\.is-active\s*\{[\s\S]*?background:\s*#0F172A;[\s\S]*?border-color:\s*#0F172A;/g,
  (m) => {
    return m.replace('#0F172A', '#FF7A00')
            .replace('#0F172A', '#FF7A00');
  });

// Accordion items
css = css.replace(/\.faq-item\s*\{[\s\S]*?background:\s*#FFFFFF;[\s\S]*?border:\s*1\.5px solid #E2E8F0;/g,
  (m) => {
    return m.replace('#FFFFFF', 'rgba(15, 23, 42, 0.7)')
            .replace('#E2E8F0', 'rgba(255, 255, 255, 0.08)');
  });

css = css.replace(/\.faq-question\s*\{[\s\S]*?color:\s*#0F172A;/g, (m) => {
  return m.replace('#0F172A', '#FFFFFF');
});

css = css.replace(/\.faq-item\.is-active \.faq-question\s*\{[\s\S]*?color:\s*#0F172A;/g, (m) => {
  return m.replace('#0F172A', '#FFFFFF');
});

css = css.replace(/\.faq-chevron\s*\{[\s\S]*?background-color:\s*#F1F5F9;[\s\S]*?border:\s*1px solid #CBD5E1;[\s\S]*?color:\s*#475569;/g,
  (m) => {
    return m.replace('#F1F5F9', 'rgba(255, 255, 255, 0.06)')
            .replace('#CBD5E1', 'rgba(255, 255, 255, 0.1)')
            .replace('#475569', '#94A3B8');
  });

css = css.replace(/\.faq-lead-text\s*\{[\s\S]*?color:\s*#334155;[\s\S]*?border-top:\s*1px solid #F1F5F9;/g,
  (m) => {
    return m.replace('#334155', '#CBD5E1')
            .replace('#F1F5F9', 'rgba(255, 255, 255, 0.08)');
  });

css = css.replace(/\.faq-takeaways\s*\{[\s\S]*?background:\s*#F8FAFC;[\s\S]*?border:\s*1px solid #E2E8F0;/g,
  (m) => {
    return m.replace('#F8FAFC', 'rgba(15, 23, 42, 0.85)')
            .replace('#E2E8F0', 'rgba(255, 255, 255, 0.08)');
  });

css = css.replace(/\.faq-takeaways-title\s*\{[\s\S]*?color:\s*#0F172A;/g, (m) => {
  return m.replace('#0F172A', '#FF9433');
});

css = css.replace(/\.faq-takeaways-list li\s*\{[\s\S]*?color:\s*#475569;/g, (m) => {
  return m.replace('#475569', '#CBD5E1');
});

css = css.replace(/\.faq-footer-callout\s*\{[\s\S]*?background:\s*#FFFFFF;[\s\S]*?border:\s*1\.5px solid #E2E8F0;/g,
  (m) => {
    return m.replace('#FFFFFF', 'rgba(15, 23, 42, 0.75)')
            .replace('#E2E8F0', 'rgba(255, 255, 255, 0.08)');
  });

css = css.replace(/\.faq-callout-text h4\s*\{[\s\S]*?color:\s*#0F172A;/g, (m) => {
  return m.replace('#0F172A', '#FFFFFF');
});

css = css.replace(/\.faq-empty-state\s*\{[\s\S]*?background:\s*#FFFFFF;[\s\S]*?border:\s*1\.5px dashed #CBD5E1;/g,
  (m) => {
    return m.replace('#FFFFFF', 'rgba(15, 23, 42, 0.6)')
            .replace('#CBD5E1', 'rgba(255, 255, 255, 0.15)');
  });

css = css.replace(/\.faq-empty-title\s*\{[\s\S]*?color:\s*#0F172A;/g, (m) => {
  return m.replace('#0F172A', '#FFFFFF');
});

fs.writeFileSync(faqPath, css, 'utf-8');
console.log('Successfully updated faq.css to midnight-slate dark shade');
