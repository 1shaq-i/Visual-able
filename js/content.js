// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getSelectedText") {
        let selectedText = window.getSelection()?.toString();
        
        // If no text is selected, try to get text from the DOM element under the cursor
        if (!selectedText) {
            const range = window.getSelection()?.getRangeAt(0);
            if (range) {
                const parentNode = range.commonAncestorContainer;
                if (parentNode) {
                    selectedText = parentNode.textContent || parentNode.innerText || "";
                }
            }
        }

        // Send back the selected text or fallback to an empty response
        sendResponse({ text: selectedText || null });
    }
});
