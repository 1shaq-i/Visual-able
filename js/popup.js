chrome.storage.local.get(["colorblindingValue", "additionalFilters"], (result) => {
    $("input[name=type][value=" + result.colorblindingValue + "]").prop('checked', true);
    if (result.additionalFilters) {
        result.additionalFilters.forEach(filter => {
            $("#toggle-" + filter).prop('checked', true);
        });
    }
});

$('#cvd_radios input[name="type"]').change(function () {
    const newValue = $('#cvd_radios input[name="type"]:checked').val();

    chrome.storage.local.set({ colorblindingValue: newValue }, () => {
        const message = { action: "cvd", payload: { type: newValue, additional: [] } };

        chrome.storage.local.get(["additionalFilters"], (result) => {
            if (result.additionalFilters) {
                message.payload.additional = result.additionalFilters;
            }

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, message);
                }
            });
        });
    });
});

$(".additional-filter").change(function () {
    const additionalFilters = $(".additional-filter:checked").map(function () {
        return $(this).val();
    }).get();

    chrome.storage.local.set({ additionalFilters }, () => {
        chrome.storage.local.get(["colorblindingValue"], (result) => {
            const message = { action: "cvd", payload: { type: result.colorblindingValue, additional: additionalFilters } };

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, message);
                }
            });
        });
    });
});

document.getElementById("toggleMagnifier").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "enableMagnifier" }, () => {
        //   window.close(); // Close the popup after sending the message

    });
    const popup = chrome.extension.getViews({ type: "popup" });
    if (popup && popup.length > 0) {
        popup[0].close();
    }
});






var background = (function () {
    let tmp = {};
    chrome.runtime.onMessage.addListener(function (request) {
        for (let id in tmp) {
            if (tmp[id] && (typeof tmp[id] === "function")) {
                if (request.path === "background-to-options") {
                    if (request.method === id) {
                        tmp[id](request.data);
                    }
                }
            }
        }
    });
    /*  */
    return {
        "receive": function (id, callback) {
            tmp[id] = callback;
        },
        "send": function (id, data) {
            chrome.runtime.sendMessage({
                "method": id,
                "data": data,
                "path": "options-to-background"
            }, function () {
                return chrome.runtime.lastError;
            });
        }
    }
})();

var config = {
    "set": function (e) {
        if (window[e.pref]) {
            window[e.pref].value = e.value;
        }
    },
    "load": function () {
        let prefs = [...document.querySelectorAll("*[data-pref]")];
        prefs.forEach(function (elem) {
            let pref = elem.getAttribute("data-pref");
            window[pref] = config.connect(elem, pref);
        });
        /*  */
        window.removeEventListener("load", config.load, false);
    },
    "connect": function (elem) {
        let att = "value";
        if (elem) {
            if (elem.type === "checkbox") att = "checked";
            if (elem.localName === "select") att = "value";
            if (elem.localName === "number") att = "value";
            /*  */
            let pref = elem.getAttribute("data-pref");
            /*  */
            background.send("get", pref);
            elem.addEventListener("change", function () {
                background.send("changed", {
                    "pref": pref,
                    "value": this[att]
                });
            });
        }
        /*  */
        return {
            get value() {
                return elem[att];
            },
            set value(val) {
                if (elem.type === "file") return;
                elem[att] = val;
            }
        }
    }
};

background.receive("set", config.set);
window.addEventListener("load", config.load, false);
