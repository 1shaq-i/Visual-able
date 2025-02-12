/* 

1. **Error Handling**:
   - Provides a function (`app.error`) to capture and log Chrome runtime errors during operations.

2. **Options Management**:
   - Handles sending and receiving messages between the options page and background scripts through Chrome's messaging API.
   - Allows storing and retrieving options/settings using Chrome's `storage.local`.

3. **Button Actions**:
   - Manages Chrome action button events, such as clicks. It provides callback functionality to execute actions when the button is clicked.

4. **Storage Handling**:
   - Provides methods for reading, writing, and updating data stored locally in Chrome's `storage.local`.
   - Caches storage data for efficient access.

5. **Tab Management**:
   - Includes functions for capturing visible tabs, opening new tabs, and querying the current or active tab's information.
   - Supports injecting JavaScript or CSS into specific tabs using Chrome's scripting API.

6. **Messaging Framework**:
   - Sets up a framework for sending and receiving messages between different parts of the extension (e.g., content scripts, background scripts, options page).
   - Facilitates communication across tabs and between the extension's UI and background processes.

7. **Event Listeners**:
   - Registers listeners for key events such as Chrome runtime startup, extension installation, and message passing.
   - Tracks updates to tabs and changes to the active tab.

8. **General App Structure**:
   - Organizes these functionalities into a modular structure (`app`) to ensure reusability and maintainability.

*/


var app = {};

app.error = function () {
  return chrome.runtime.lastError;
};

app.options = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      app.options.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({"data": data, "method": id, "path": "background-to-options"}, app.error);
    }
  },
  "post": function (id, data) {
    if (id) {
      if (app.options.port) {
        app.options.port.postMessage({"data": data, "method": id, "path": "background-to-options"});
      }
    }
  }
};

app.button = {
  "on": {
    "clicked": function (callback) {
      console.log(callback)
      chrome.action.onClicked.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        }); 
      });
    }
  },
  "icon": function (tabId, path, callback) {
    // if (path && typeof path === "object") {
    //   const options = {"path": path};
    //   if (tabId) options["tabId"] = tabId;
    //   chrome.action.setIcon(options, function (e) {
    //     if (callback) callback(e);
    //   });
    // } else {
    //   const options = {
    //     "path": {
    //       "16": "../data/icons/" + (path ? path + '/' : '') + "16.png",
    //       "32": "../data/icons/" + (path ? path + '/' : '') + "32.png",
    //       "48": "../data/icons/" + (path ? path + '/' : '') + "48.png",
    //       "64": "../data/icons/" + (path ? path + '/' : '') + "64.png"
    //     }
    //   };
    //   /*  */
    //   if (tabId) options["tabId"] = tabId;
    //   chrome.action.setIcon(options, function (e) {
    //     if (callback) callback(e);
    //   }); 
    // }
  }
};

app.storage = {
  "local": {},
  "read": function (id) {
    return app.storage.local[id];
  },
  "update": function (callback) {
    if (app.session) app.session.load();
    /*  */
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  "write": function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    /*  */
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  "load": function (callback) {
    const keys = Object.keys(app.storage.local);
    if (keys && keys.length) {
      if (callback) {
        callback("cache");
      }
    } else {
      app.storage.update(function () {
        if (callback) callback("disk");
      });
    }
  } 
};

app.page = {
  "port": null,
  "message": {},
  "sender": {
    "port": {}
  },
  "receive": function (id, callback) {
    if (id) {
      app.page.message[id] = callback;
    }
  },
  "post": function (id, data, tabId) {
    if (id) {
      if (tabId) {
        if (app.page.sender.port[tabId]) {
          app.page.sender.port[tabId].postMessage({"data": data, "method": id, "path": "background-to-page"});
        }
      } else if (app.page.port) {
        app.page.port.postMessage({"data": data, "method": id, "path": "background-to-page"});
      }
    }
  },
  "send": function (id, data, tabId, frameId) {
    if (id) {
      chrome.tabs.query({}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          const message = {
            "method": id, 
            "data": data ? data : {}, 
            "path": "background-to-page"
          };
          /*  */
          tabs.forEach(function (tab) {
            if (tab) {
              message.data.tabId = tab.id;
              message.data.top = tab.url ? tab.url : '';
              message.data.title = tab.title ? tab.title : '';
              /*  */
              if (tabId !== null && tabId !== undefined) {
                if (tabId === tab.id) {
                  if (frameId !== null && frameId !== undefined) {
                    chrome.tabs.sendMessage(tab.id, message, {"frameId": frameId}, app.error);
                  } else {
                    chrome.tabs.sendMessage(tab.id, message, app.error);
                  }
                }
              } else {
                chrome.tabs.sendMessage(tab.id, message, app.error);
              }
            }
          });
        }
      });
    }
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "connect": function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  "storage": function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  }
};

app.tab = {
  "capture": function (windowId, options, callback) {
    if (chrome.tabs.captureVisibleTab) {
      if (windowId) {
        chrome.tabs.captureVisibleTab(windowId, options, function (e) {
          if (callback) callback(e);
        });
      } else {
        chrome.tabs.captureVisibleTab(options, function (e) {
          if (callback) callback(e);
        });
      }
    }
  },
  "open": function (url, index, active, callback) {
    const properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  },
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    "active": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    }
  },
  "inject": {
    "js": function (options, callback) {
      if (chrome.scripting) {
        chrome.scripting.executeScript(options, function (e) {
          let tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    },
    "css": function (options, callback) {
      if (chrome.scripting) {
        chrome.scripting.insertCSS(options, function (e) {
          let tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    }
  },
  "on": {
    "updated": function (callback) {
      chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        app.storage.load(function () {
          if (info && info.status) {
            callback(tab);
          }
        });
      });
    },
    "activated": function (callback) {
      chrome.tabs.onActivated.addListener(function (activeInfo) {
        app.storage.load(function () {
          chrome.tabs.get(activeInfo.tabId, function (tab) {
            let error = chrome.runtime.lastError;
            callback(tab ? tab : {"id": activeInfo.tabId});
          });
        });
      });
    }
  }
};
