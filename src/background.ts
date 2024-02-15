// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'yourAction') {
    // Use the full `chrome` object here
    // @ts-ignore
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Access the active tab's URL, etc.
      sendResponse({ url: tabs[0].url });
    });
  }
});
