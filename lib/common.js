var core = {
  "capture": function () {
    app.tab.query.active(function (tab) {
      if (tab) {
        if (tab.url) {
          app.tab.inject.js({"target": {"tabId": tab.id}, "files": ["/data/content_script/inject.js"]}, function () {
            app.tab.inject.css({"target": {"tabId": tab.id}, "files": ["/data/content_script/inject.css"]}, function () {
              config.magnifier.state = config.magnifier.state === "ON" ? "OFF" : "ON";
              /*  */
              if (config.magnifier.state === "ON") {
                app.tab.capture(null, {"format": "jpeg", "quality": 100}, function (screenshot) {
                  let tmp = chrome.runtime.lastError;
                  /*  */
                  // app.button.icon(tab.id, config.magnifier.state);
                  app.page.send("screenshot", {
                    "src": screenshot,
                    "size": config.magnifier.size,
                    "zoom": config.magnifier.zoom,
                    "color": config.magnifier.color,
                    "state": config.magnifier.state
                  }, tab.id, null);
                });
              } else {
                core.action.reset(true);
              }
            });
          });
        }
      }
    });
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "reset": function (flag) {
      config.magnifier.state = "OFF";
      /*  */
      if (config.magnifier.timeout) clearTimeout(config.magnifier.timeout);
      config.magnifier.timeout = setTimeout(function () {
        app.tab.query.active(function (tab) {
          if (tab) {
            // app.button.icon(tab.id, config.magnifier.state);
            if (flag) {
              app.page.send("reset", null, tab.id, null);
            }
          }
        });
      }, 100);
    },
    "options": {
      "get": function (pref) {
        app.options.send("set", {
          "pref": pref, 
          "value": config.get(pref)
        });
      },
      "set": function (o) {
        config.set(o.pref, o.value);
        /*  */
        app.options.send("set", {
          "pref": o.pref, 
          "value": config.get(o.pref)
        });
      }
    }
  }
};

app.options.receive("get", core.action.options.get);
app.options.receive("changed", core.action.options.set);
app.page.receive("reset", function () {core.action.reset(false)});

app.tab.on.updated(function () {core.action.reset(false)});
app.tab.on.activated(function () {core.action.reset(true)});
app.on.storage(core.action.storage);
