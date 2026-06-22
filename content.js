(function() {
  // Prevent multiple initializations
  if (window.__tailwindSandboxInitialized) {
    console.log('Tailwind CSS Sandbox: Already initialized on this page.');
    return;
  }
  window.__tailwindSandboxInitialized = true;

  // Inject Tailwind Play CDN dynamically to ensure utility classes are active on any webpage
  if (!document.getElementById('tw-sandbox-tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'tw-sandbox-tailwind-cdn';
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }

  // State Management
  let isSandboxActive = true;
  let hoveredElement = null;
  let selectedElement = null;

  // DOM Elements injected into the page
  let hoverOverlay = null;
  let selectedOverlay = null;
  let sidebarEl = null;
  let toastEl = null;

  // Tailwind Spacing Values
  const spacingValues = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64'];

  // Initialize all elements
  function initDOM() {
    // 1. Hover Overlay
    hoverOverlay = document.createElement('div');
    hoverOverlay.className = 'tw-sandbox-hover-overlay';
    hoverOverlay.style.display = 'none';
    document.body.appendChild(hoverOverlay);

    // 2. Selected Overlay
    selectedOverlay = document.createElement('div');
    selectedOverlay.className = 'tw-sandbox-selected-overlay';
    selectedOverlay.style.display = 'none';
    document.body.appendChild(selectedOverlay);

    // 3. Toast Notifier
    toastEl = document.createElement('div');
    toastEl.className = 'tw-sandbox-toast';
    toastEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span id="tw-sandbox-toast-text">Copied to clipboard!</span>
    `;
    document.body.appendChild(toastEl);

    // 4. Sidebar Container
    sidebarEl = document.createElement('div');
    sidebarEl.className = 'tw-sandbox-sidebar tw-sandbox-active';
    
    sidebarEl.innerHTML = `
      <div class="tw-sandbox-header">
        <div class="tw-sandbox-title-container">
          <h1 class="tw-sandbox-title">Tailwind Sandbox Max</h1>
          <p class="tw-sandbox-subtitle">Visual Real-time HTML Editor</p>
        </div>
        <button class="tw-sandbox-close-btn" id="tw-sandbox-close">Close</button>
      </div>

      <div class="tw-sandbox-content">
        <!-- Element Info -->
        <div class="tw-sandbox-element-info">
          <span class="tw-sandbox-element-tag" id="tw-sandbox-el-tag">div</span>
          <span class="tw-sandbox-element-details" id="tw-sandbox-el-details">No element locked</span>
        </div>

        <!-- Raw Tailwind Classes -->
        <div class="tw-sandbox-section">
          <label class="tw-sandbox-label">Tailwind Utility Classes</label>
          <textarea class="tw-sandbox-textarea" id="tw-sandbox-classes" placeholder="e.g. flex bg-blue-500 p-4 text-white rounded-lg shadow-lg"></textarea>
        </div>

        <!-- Text Content Editor -->
        <div class="tw-sandbox-section">
          <label class="tw-sandbox-label">Inner Text Content</label>
          <input class="tw-sandbox-input" type="text" id="tw-sandbox-text-content" placeholder="Edit element inner text here..." />
        </div>

        <!-- Spacing Sliders -->
        <div class="tw-sandbox-section">
          <label class="tw-sandbox-label">Padding & Margin Spacing</label>
          <div class="tw-sandbox-grid-sliders">
            <div class="tw-sandbox-slider-group">
              <div class="tw-sandbox-slider-header">
                <span class="tw-sandbox-slider-title">Padding (p-*)</span>
                <span class="tw-sandbox-slider-val" id="tw-sandbox-p-val">None</span>
              </div>
              <input type="range" class="tw-sandbox-range-input" id="tw-sandbox-p-slider" min="-1" max="17" value="-1" />
            </div>

            <div class="tw-sandbox-slider-group">
              <div class="tw-sandbox-slider-header">
                <span class="tw-sandbox-slider-title">Margin (m-*)</span>
                <span class="tw-sandbox-slider-val" id="tw-sandbox-m-val">None</span>
              </div>
              <input type="range" class="tw-sandbox-range-input" id="tw-sandbox-m-slider" min="-1" max="17" value="-1" />
            </div>
          </div>
        </div>

        <!-- Flexbox Layout -->
        <div class="tw-sandbox-section">
          <label class="tw-sandbox-label">Flexbox Direction & Alignment</label>
          <div class="tw-sandbox-row">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; color: #94a3b8;">Direction</span>
              <select class="tw-sandbox-select" id="tw-sandbox-flex-dir">
                <option value="">None / Block</option>
                <option value="flex-row">Row</option>
                <option value="flex-col">Column</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; color: #94a3b8;">Justify Content</span>
              <select class="tw-sandbox-select" id="tw-sandbox-flex-justify">
                <option value="">None</option>
                <option value="justify-start">Start</option>
                <option value="justify-center">Center</option>
                <option value="justify-end">End</option>
                <option value="justify-between">Between</option>
              </select>
            </div>
          </div>
          <div class="tw-sandbox-row" style="margin-top: 8px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; color: #94a3b8;">Align Items</span>
              <select class="tw-sandbox-select" id="tw-sandbox-flex-items">
                <option value="">None</option>
                <option value="items-start">Start</option>
                <option value="items-center">Center</option>
                <option value="items-end">End</option>
                <option value="items-stretch">Stretch</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div class="tw-sandbox-section">
          <label class="tw-sandbox-label">Typography Style</label>
          <div class="tw-sandbox-row">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; color: #94a3b8;">Font Size</span>
              <select class="tw-sandbox-select" id="tw-sandbox-text-size">
                <option value="">None</option>
                <option value="text-xs">XS</option>
                <option value="text-sm">SM</option>
                <option value="text-base">Base</option>
                <option value="text-lg">LG</option>
                <option value="text-xl">XL</option>
                <option value="text-2xl">2XL</option>
                <option value="text-3xl">3XL</option>
                <option value="text-4xl">4XL</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; color: #94a3b8;">Font Weight</span>
              <select class="tw-sandbox-select" id="tw-sandbox-text-weight">
                <option value="">None</option>
                <option value="font-thin">Thin</option>
                <option value="font-light">Light</option>
                <option value="font-normal">Normal</option>
                <option value="font-medium">Medium</option>
                <option value="font-semibold">Semibold</option>
                <option value="font-bold">Bold</option>
                <option value="font-extrabold">Extra Bold</option>
              </select>
            </div>
          </div>
        </div>

        <p class="tw-sandbox-status-tip">Tip: Press ESC to clear locking overlay.</p>
      </div>

      <div class="tw-sandbox-footer">
        <button class="tw-sandbox-btn-primary" id="tw-sandbox-copy-classes">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Class List
        </button>
        <button class="tw-sandbox-btn-secondary" id="tw-sandbox-copy-html">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Copy HTML Markup
        </button>
      </div>
    `;

    document.body.appendChild(sidebarEl);
    
    // Bind Event Listeners
    setupEvents();
  }

  // Position highlighting overlays correctly on window scroll/resize
  function updateOverlayPosition(element, overlay) {
    if (!element || !overlay) return;
    const rect = element.getBoundingClientRect();
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
  }

  // Show dynamic alert toasts
  function showToast(message) {
    const textEl = document.getElementById('tw-sandbox-toast-text');
    if (textEl) textEl.textContent = message;
    toastEl.classList.add('tw-sandbox-toast-visible');
    setTimeout(() => {
      toastEl.classList.remove('tw-sandbox-toast-visible');
    }, 2200);
  }

  // Check if target element should be excluded from inspector
  function isExcluded(target) {
    if (!target) return true;
    // Exclude anything in our sandbox sidebar or overlay elements
    return target.closest('.tw-sandbox-sidebar') || 
           target.classList.contains('tw-sandbox-hover-overlay') || 
           target.classList.contains('tw-sandbox-selected-overlay') ||
           target.classList.contains('tw-sandbox-toast') ||
           target === document.documentElement || 
           target === document.body;
  }

  // Find value index in spacing values array
  function getSpacingIndex(className, prefix) {
    const regex = new RegExp(`\\b${prefix}-(\\d+(\\.\\d+)?)\\b`);
    const match = className.match(regex);
    if (match) {
      const val = match[1];
      return spacingValues.indexOf(val);
    }
    return -1;
  }

  // Populate sidebar interface with values of selected element
  function loadSelectedElementInfo() {
    if (!selectedElement) {
      document.getElementById('tw-sandbox-el-tag').textContent = 'div';
      document.getElementById('tw-sandbox-el-details').textContent = 'No element locked';
      document.getElementById('tw-sandbox-classes').value = '';
      document.getElementById('tw-sandbox-text-content').value = '';
      return;
    }

    const tag = selectedElement.tagName.toLowerCase();
    const classList = selectedElement.className || '';
    
    // Clean classes (remove any sandbox indicators or trailing spaces)
    const cleanedClasses = classList.trim().replace(/\s+/g, ' ');

    // Set header info
    document.getElementById('tw-sandbox-el-tag').textContent = tag;
    document.getElementById('tw-sandbox-el-details').textContent = `${cleanedClasses.split(' ').filter(Boolean).length} classes`;
    
    // Set textarea classes
    document.getElementById('tw-sandbox-classes').value = cleanedClasses;

    // Set inner text content
    document.getElementById('tw-sandbox-text-content').value = selectedElement.innerText || '';

    // Spacing Sliders
    const pIndex = getSpacingIndex(cleanedClasses, 'p');
    document.getElementById('tw-sandbox-p-slider').value = pIndex;
    document.getElementById('tw-sandbox-p-val').textContent = pIndex >= 0 ? `p-${spacingValues[pIndex]}` : 'None';

    const mIndex = getSpacingIndex(cleanedClasses, 'm');
    document.getElementById('tw-sandbox-m-slider').value = mIndex;
    document.getElementById('tw-sandbox-m-val').textContent = mIndex >= 0 ? `m-${spacingValues[mIndex]}` : 'None';

    // Flexbox
    const flexDir = cleanedClasses.match(/\b(flex-row|flex-col)\b/);
    document.getElementById('tw-sandbox-flex-dir').value = flexDir ? flexDir[0] : '';

    const flexJustify = cleanedClasses.match(/\b(justify-start|justify-center|justify-end|justify-between)\b/);
    document.getElementById('tw-sandbox-flex-justify').value = flexJustify ? flexJustify[0] : '';

    const flexItems = cleanedClasses.match(/\b(items-start|items-center|items-end|items-stretch)\b/);
    document.getElementById('tw-sandbox-flex-items').value = flexItems ? flexItems[0] : '';

    // Typography
    const textSize = cleanedClasses.match(/\b(text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl)\b/);
    document.getElementById('tw-sandbox-text-size').value = textSize ? textSize[0] : '';

    const textWeight = cleanedClasses.match(/\b(font-thin|font-light|font-normal|font-medium|font-semibold|font-bold|font-extrabold)\b/);
    document.getElementById('tw-sandbox-text-weight').value = textWeight ? textWeight[0] : '';
  }

  // Update target element's class name helper
  function updateElementClasses(classesStr) {
    if (!selectedElement) return;
    selectedElement.className = classesStr;
    
    // Update badge details
    const count = classesStr.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('tw-sandbox-el-details').textContent = `${count} classes`;

    // Recalculate overlay positions as element geometry might have shifted
    setTimeout(() => {
      updateOverlayPosition(selectedElement, selectedOverlay);
    }, 50);
  }

  // Apply visual changes back to classes textarea
  function rebuildClassesFromControls() {
    if (!selectedElement) return;

    let classes = document.getElementById('tw-sandbox-classes').value.trim().split(/\s+/).filter(Boolean);

    // 1. Spacing - Padding
    const pSliderVal = parseInt(document.getElementById('tw-sandbox-p-slider').value);
    // Remove existing uniform paddings
    classes = classes.filter(c => !c.match(/^p-\d+(\.\d+)?$/));
    if (pSliderVal >= 0) {
      classes.push(`p-${spacingValues[pSliderVal]}`);
      document.getElementById('tw-sandbox-p-val').textContent = `p-${spacingValues[pSliderVal]}`;
    } else {
      document.getElementById('tw-sandbox-p-val').textContent = 'None';
    }

    // 2. Spacing - Margin
    const mSliderVal = parseInt(document.getElementById('tw-sandbox-m-slider').value);
    classes = classes.filter(c => !c.match(/^m-\d+(\.\d+)?$/));
    if (mSliderVal >= 0) {
      classes.push(`m-${spacingValues[mSliderVal]}`);
      document.getElementById('tw-sandbox-m-val').textContent = `m-${spacingValues[mSliderVal]}`;
    } else {
      document.getElementById('tw-sandbox-m-val').textContent = 'None';
    }

    // 3. Flex Direction
    const flexDirVal = document.getElementById('tw-sandbox-flex-dir').value;
    classes = classes.filter(c => c !== 'flex-row' && c !== 'flex-col');
    if (flexDirVal) {
      classes.push(flexDirVal);
      // Ensure element has display flex if layout modifier is selected
      if (!classes.includes('flex')) {
        classes.push('flex');
      }
    }

    // 4. Flex Justify
    const flexJustifyVal = document.getElementById('tw-sandbox-flex-justify').value;
    classes = classes.filter(c => !c.match(/^justify-(start|center|end|between)$/));
    if (flexJustifyVal) {
      classes.push(flexJustifyVal);
      if (!classes.includes('flex')) classes.push('flex');
    }

    // 5. Flex Items
    const flexItemsVal = document.getElementById('tw-sandbox-flex-items').value;
    classes = classes.filter(c => !c.match(/^items-(start|center|end|stretch)$/));
    if (flexItemsVal) {
      classes.push(flexItemsVal);
      if (!classes.includes('flex')) classes.push('flex');
    }

    // 6. Font Size
    const textSizeVal = document.getElementById('tw-sandbox-text-size').value;
    classes = classes.filter(c => !c.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/));
    if (textSizeVal) {
      classes.push(textSizeVal);
    }

    // 7. Font Weight
    const textWeightVal = document.getElementById('tw-sandbox-text-weight').value;
    classes = classes.filter(c => !c.match(/^font-(thin|light|normal|medium|semibold|bold|extrabold)$/));
    if (textWeightVal) {
      classes.push(textWeightVal);
    }

    // Join and update textarea & target element
    const finalClassesStr = classes.join(' ');
    document.getElementById('tw-sandbox-classes').value = finalClassesStr;
    updateElementClasses(finalClassesStr);
  }

  // Setup extension UI control event handlers
  function setupEvents() {
    // 1. Textarea updates
    const classesTextarea = document.getElementById('tw-sandbox-classes');
    classesTextarea.addEventListener('input', (e) => {
      updateElementClasses(e.target.value);
    });

    // 2. Text Content updates
    const textInput = document.getElementById('tw-sandbox-text-content');
    textInput.addEventListener('input', (e) => {
      if (selectedElement) {
        selectedElement.innerText = e.target.value;
        setTimeout(() => {
          updateOverlayPosition(selectedElement, selectedOverlay);
        }, 50);
      }
    });

    // 3. Spacing Sliders
    document.getElementById('tw-sandbox-p-slider').addEventListener('input', rebuildClassesFromControls);
    document.getElementById('tw-sandbox-m-slider').addEventListener('input', rebuildClassesFromControls);

    // 4. Flex direction and alignment selects
    document.getElementById('tw-sandbox-flex-dir').addEventListener('change', rebuildClassesFromControls);
    document.getElementById('tw-sandbox-flex-justify').addEventListener('change', rebuildClassesFromControls);
    document.getElementById('tw-sandbox-flex-items').addEventListener('change', rebuildClassesFromControls);

    // 5. Typography selects
    document.getElementById('tw-sandbox-text-size').addEventListener('change', rebuildClassesFromControls);
    document.getElementById('tw-sandbox-text-weight').addEventListener('change', rebuildClassesFromControls);

    // 6. Copy Buttons
    document.getElementById('tw-sandbox-copy-classes').addEventListener('click', () => {
      if (!selectedElement) {
        showToast('Please select an element first.');
        return;
      }
      const classes = selectedElement.className || '';
      navigator.clipboard.writeText(classes.trim())
        .then(() => showToast('Class list copied!'))
        .catch(err => console.error('Failed to copy: ', err));
    });

    document.getElementById('tw-sandbox-copy-html').addEventListener('click', () => {
      if (!selectedElement) {
        showToast('Please select an element first.');
        return;
      }
      const html = selectedElement.outerHTML || '';
      navigator.clipboard.writeText(html)
        .then(() => showToast('HTML Markup copied!'))
        .catch(err => console.error('Failed to copy: ', err));
    });

    // 7. Sidebar close button
    document.getElementById('tw-sandbox-close').addEventListener('click', () => {
      sidebarEl.classList.remove('tw-sandbox-active');
      selectedElement = null;
      selectedOverlay.style.display = 'none';
    });

    // 8. ESC key logic
    window.addEventListener('keydown', (e) => {
      if (!isSandboxActive) return;
      if (e.key === 'Escape') {
        selectedElement = null;
        selectedOverlay.style.display = 'none';
        hoverOverlay.style.display = 'none';
        sidebarEl.classList.remove('tw-sandbox-active');
      }
    });

    // 9. Document Mouse interactions
    document.addEventListener('mouseover', (e) => {
      if (!isSandboxActive || selectedElement) return;
      const target = e.target;
      if (isExcluded(target)) {
        hoverOverlay.style.display = 'none';
        return;
      }
      hoveredElement = target;
      hoverOverlay.style.display = 'block';
      updateOverlayPosition(hoveredElement, hoverOverlay);
    }, true);

    document.addEventListener('mouseout', (e) => {
      if (!isSandboxActive) return;
      if (e.target === hoveredElement) {
        hoveredElement = null;
        hoverOverlay.style.display = 'none';
      }
    }, true);

    document.addEventListener('click', (e) => {
      if (!isSandboxActive) return;
      
      const target = e.target;
      if (isExcluded(target)) return;

      // Lock element
      e.preventDefault();
      e.stopPropagation();

      selectedElement = target;
      hoverOverlay.style.display = 'none';
      
      // Update locked overlay position & display
      selectedOverlay.style.display = 'block';
      updateOverlayPosition(selectedElement, selectedOverlay);

      // Open Sidebar Editor
      sidebarEl.classList.add('tw-sandbox-active');
      loadSelectedElementInfo();
    }, true);

    // Track window events to align box overlay overlays
    window.addEventListener('resize', () => {
      if (selectedElement) updateOverlayPosition(selectedElement, selectedOverlay);
      if (hoveredElement) updateOverlayPosition(hoveredElement, hoverOverlay);
    });

    window.addEventListener('scroll', () => {
      if (selectedElement) updateOverlayPosition(selectedElement, selectedOverlay);
      if (hoveredElement) updateOverlayPosition(hoveredElement, hoverOverlay);
    });
  }

  // Toggle activation of the interactive inspect sandbox overlays
  function toggleSandbox() {
    isSandboxActive = !isSandboxActive;
    console.log('Tailwind CSS Sandbox: Toggle Active State ->', isSandboxActive);

    if (isSandboxActive) {
      // Re-enable visual indicators
      sidebarEl.style.display = 'flex';
      sidebarEl.classList.add('tw-sandbox-active');
    } else {
      // Disable overlays & hide sidebars
      sidebarEl.classList.remove('tw-sandbox-active');
      setTimeout(() => {
        sidebarEl.style.display = 'none';
      }, 400);

      hoverOverlay.style.display = 'none';
      selectedOverlay.style.display = 'none';
      selectedElement = null;
      hoveredElement = null;
    }
  }

  // Listen to toggle events sent from the extension background service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle-sandbox') {
      toggleSandbox();
      sendResponse({ status: isSandboxActive ? 'active' : 'inactive' });
    }
    return true;
  });

  // Self mount the DOM contents
  initDOM();
  console.log('Tailwind CSS Sandbox: Content script initial configuration complete.');
})();
