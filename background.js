importScripts("lib/config.js");
importScripts("lib/chrome.js");
importScripts("lib/runtime.js");
importScripts("lib/common.js");

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // Code for first-time installation
        chrome.storage.local.set({ colorblindingValue: "normal" });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enableMagnifier") {
        core.capture(); // Call magnifier activation
    }
});
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-magnifier") {
      core.capture();  // Existing function that toggles magnifier
    }
  });
  

