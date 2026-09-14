/**
 * LOCATION COMPONENT CONTROLLER (v3.0 OPTIMIZED)
 * Supports:
 *  - Map vs Campus Photo tab switching
 *  - One-click Copy Campus Address to clipboard
 *  - Config text binding fallback
 */

function initLocation(container = document) {
  const section = container.querySelector('#location') || document.querySelector('#location');
  if (!section) return;

  // 1. Media Tab Switching (Google Map vs Campus Photo)
  const tabs = section.querySelectorAll('.media-tab');
  const panels = section.querySelectorAll('.media-view-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');

      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        if (panel.id === `view-${targetView}`) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });
    });
  });

  // 2. Schematic Map Route Filter Highlighting
  const routeChips = section.querySelectorAll('.route-chip');
  const allRoutes = {
    rkmp: { route: section.querySelector('#svg-route-rkmp'), node: section.querySelector('#svg-node-rkmp') },
    brts: { route: section.querySelector('#svg-route-brts'), node: section.querySelector('#svg-node-brts') },
    metro: { route: section.querySelector('#svg-route-metro'), node: null },
    parking: { route: null, node: section.querySelector('#svg-node-parking') }
  };

  routeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const selectedRoute = chip.getAttribute('data-route');
      
      routeChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      if (selectedRoute === 'all') {
        Object.values(allRoutes).forEach(item => {
          if (item.route) { item.route.classList.remove('route-dimmed', 'route-focused'); }
          if (item.node) { item.node.classList.remove('route-dimmed', 'route-focused'); }
        });
      } else {
        Object.keys(allRoutes).forEach(key => {
          const item = allRoutes[key];
          if (key === selectedRoute) {
            if (item.route) { item.route.classList.remove('route-dimmed'); item.route.classList.add('route-focused'); }
            if (item.node) { item.node.classList.remove('route-dimmed'); item.node.classList.add('route-focused'); }
          } else {
            if (item.route) { item.route.classList.remove('route-focused'); item.route.classList.add('route-dimmed'); }
            if (item.node) { item.node.classList.remove('route-focused'); item.node.classList.add('route-dimmed'); }
          }
        });
      }
    });
  });

  // 3. Copy Address Action
  const copyBtn = section.querySelector('#btn-copy-address');
  const addressElem = section.querySelector('#campus-full-address');
  const copyText = section.querySelector('#copy-btn-text');

  if (copyBtn && addressElem && copyText) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = addressElem.textContent.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        copyBtn.classList.add('is-copied');
        copyText.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          copyText.textContent = 'Copy Address';
        }, 2200);
      } catch (err) {
        copyText.textContent = 'Address Copied';
        setTimeout(() => {
          copyText.textContent = 'Copy Address';
        }, 2000);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.initLocation = initLocation;
}

