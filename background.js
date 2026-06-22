// Listen for when the user clicks the extension action icon in the toolbar
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) {
    console.warn('Tailwind CSS Sandbox: Clicked tab has no ID.');
    return;
  }

  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
    console.warn('Tailwind CSS Sandbox: Cannot run sandbox on internal browser system pages.');
    return;
  }

  console.log('Tailwind CSS Sandbox: Action clicked on tab', tab.id);

  // Check if our sandbox is already initialized on this tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      return typeof window.__tailwindSandboxInitialized !== 'undefined';
    }
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.warn('Tailwind CSS Sandbox: Check script failed:', chrome.runtime.lastError.message);
      return;
    }

    const isInitialized = results && results[0] && results[0].result;
    console.log('Tailwind CSS Sandbox: Is script already initialized?', !!isInitialized);

    if (!isInitialized) {
      console.log('Tailwind CSS Sandbox: First time run. Injecting content.css and content.js...');
      
      // Inject CSS
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      })
      .then(() => {
        console.log('Tailwind CSS Sandbox: CSS injected successfully. Injecting content.js...');
        // Inject JS
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      })
      .then(() => {
        console.log('Tailwind CSS Sandbox: content.js executed successfully. Sandbox is now active.');
      })
      .catch((err) => {
        console.error('Tailwind CSS Sandbox: Failed to inject assets:', err);
      });

    } else {
      console.log('Tailwind CSS Sandbox: Already initialized. Toggling active state...');
      
      // Send toggle message
      chrome.tabs.sendMessage(tab.id, { action: 'toggle-sandbox' })
        .then((response) => {
          console.log('Tailwind CSS Sandbox: Toggle message sent successfully, response:', response);
        })
        .catch((err) => {
          console.warn('Tailwind CSS Sandbox: Failed to send toggle message, re-injecting script...', err);
          
          // Re-inject if context was lost (e.g. page refreshed/navigated)
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css']
          })
          .then(() => {
            return chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
          })
          .then(() => {
            console.log('Tailwind CSS Sandbox: Re-injection complete.');
          })
          .catch((reInjectErr) => {
            console.error('Tailwind CSS Sandbox: Re-injection failed:', reInjectErr);
          });
        });
    }
  });
});
