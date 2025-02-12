function injectSVG(document) {
    const colorblindSVG = `
    <svg id="colorBlindSVG" version="1.1" xmlns="http://www.w3.org/2000/svg" baseProfile="full">
        <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="protanomaly">
            <feColorMatrix type="matrix" values="0.817 0.183 0 0 0  0.333 0.667 0 0 0  0 0.125 0.875 0 0  0 0 0 1 0" />
        </filter>
        <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
        <filter id="deuteranomaly">
            <feColorMatrix type="matrix" values="0.8 0.2 0 0 0  0.258 0.742 0 0 0  0 0.142 0.858 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tritanomaly">
            <feColorMatrix type="matrix" values="0.967 0.033 0 0 0  0 0.733 0.267 0 0  0 0.183 0.817 0 0  0 0 0 1 0" />
        </filter>
        <filter id="achromatopsia">
            <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
        </filter>
        <filter id="achromatomaly">
            <feColorMatrix type="matrix" values="0.618 0.320 0.062 0 0  0.163 0.775 0.062 0 0  0.163 0.320 0.516 0 0  0 0 0 1 0" />
        </filter>
        <filter id="high-contrast">
            <feColorMatrix type="matrix" values="1.5 0 0 0 -0.5  0 1.5 0 0 -0.5  0 0 1.5 0 -0.5  0 0 0 1 0" />
        </filter>
        <filter id="dark-mode">
            <feColorMatrix type="matrix" values="0.85 0.1 0.05 0 0  0.1 0.75 0.05 0 0  0.05 0.05 0.6 0 0  0 0 0 1 0" />
        </filter>
    </svg>`;

    const existingDiv = document.getElementById("blockColorblindContent");
    if (existingDiv) {
        existingDiv.remove();
    }

    const container = document.createElement("div");
    container.id = "blockColorblindContent";
    container.innerHTML = colorblindSVG;
    container.style.display = "none";

    document.body.appendChild(container);
}

function applyColorFilter(filterType, additionalFilters = []) {
    injectSVG(document);
    resetColors(document);

    const filters = [
        `url(#${filterType})`,
        ...additionalFilters.map(filter => `url(#${filter})`)
    ].join(' ');

    const styleContent = `html {
        filter: ${filters};
        -webkit-filter: ${filters};
        -moz-filter: ${filters};
        -o-filter: ${filters};
        -ms-filter: ${filters};
    }`;

    updateStyles(document, styleContent);
}

function resetColors(document) {
    const styleContent = `html {
        -webkit-filter: none;
        -moz-filter: none;
        -o-filter: none;
        -ms-filter: none;
    }`;

    updateStyles(document, styleContent);
}

function updateStyles(document, cssContent) {
    const head = document.head;
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";

    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = cssContent;
    } else {
        styleElement.appendChild(document.createTextNode(cssContent));
    }

    head.appendChild(styleElement);
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "cvd") {
        applyColorFilter(message.payload.type, message.payload.additional || []);
    }
});

chrome.storage.local.get(["colorblindingValue", "additionalFilters"], (result) => {
    if (result.colorblindingValue) {
        applyColorFilter(result.colorblindingValue, result.additionalFilters || []);
    }
});
