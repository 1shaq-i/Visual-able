# Visual-able

**Visual-able** is a Chrome Extension designed to empower users with visual impairments to browse more comfortably. It offers a suite of accessibility features—colourblind filters, a magnifier, text-to-speech, high-contrast and night modes—right at your fingertips.
It is Available on the Chrome Extension store: https://chromewebstore.google.com/detail/visual-able/ajbalmmngklhkkanmieelghghnjganjn?hl=en-GB&authuser=0
---

##  Features

- **Colourblind Modes**  
  Multiple filter presets to help users with different types of colour vision deficiencies.

- **Magnifier Tool**  
  Zoom into sections of the page for better readability.

- **Text-to-Speech**  
  Converts on-page text into spoken words for easy listening.

- **High-Contrast & Night Modes**  
  Enhance visibility in various lighting conditions.

- **Quick Access Panel**  
  Easily toggle features on or off via the popup interface.

---

##  Demo

Install the extension from the Chrome Web Store:  
[Visual-able on Chrome Web Store](https://chromewebstore.google.com/detail/visual-able/ajbalmmngklhkkanmieelghghnjganjn)

1. **Clone the repo**  
   ```bash
   git clone https://github.com/1shaq-i/Visual-able.git

2. Open chrome://extensions/ -> toggle Developer mode
3. Click Load unpacked -> select the project folder

**Project Structure
```bash
Visual-able/
├─ manifest.json         # Extension metadata & permissions (MV3)
├─ popup.html            # Popup UI
├─ background.js         # Background service worker
├─ js/                   # Core JS for UI/filters/logic
├─ css/                  # Styles for popup/UI
├─ data/content_script/  # Content scripts injected into pages
├─ lib/                  # Helper libraries (if any)
└─ icon.png              # Extension icon

