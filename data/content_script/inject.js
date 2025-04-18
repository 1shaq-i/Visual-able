if (!background) {
  var background = (function () {
    let tmp = {};
    /*  */
    chrome.runtime.onMessage.addListener(function (request) {
      for (let id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-page") {
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
          "path": "page-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
    }
  })();

  var config = {
    "zoom": 2,
    "width": 150,
    "height": 150,
    "state": "ON",
    "position": {
      'x': 200, 
      'y': 200
    },
    "id": {
      "image": "magnifying-glass-image",
      "container": "magnifying-glass-container"
    },
    "keydown": function (e) {
      if (e.keyCode === 27) {
        config.clear(true);
      }
    },
    "clear": function (flag) {
      let image = document.getElementById(config.id.image);
      let container = document.getElementById(config.id.container);
      /*  */
      if (image) image.remove();
      if (container) container.remove();
      if (flag) background.send("reset");
    },
    "mousemove": function (e) {
      if (e) config.position = e;
      let image = document.getElementById(config.id.image);
      let container = document.getElementById(config.id.container);
      /*  */
      if (image && container) {
        image.style.top = (-1 * config.position.clientY + config.height / 2) + "px";
        image.style.left = (-1 * config.position.clientX + config.width / 2) + "px";
        container.style.top = (+1 * (config.position.clientY + window.scrollY) - config.height / 2) + "px";
        container.style.left = (+1 * (config.position.clientX + window.scrollX) - config.width / 2) + "px";
      }
    },
    "screenshot": function (o) {
      config.clear(false);
      /*  */
      config.zoom = o.zoom;
      config.color = o.color;
      config.state = o.state;
      config.width = Number(o.size);
      config.height = Number(o.size);
      /*  */
      if (config.state === "ON") {
        let root = document.documentElement;
        let div = document.createElement("div");
        let img = document.createElement("img");
        /*  */
        img.setAttribute("src", o.src);
        img.setAttribute("id", config.id.image);
        img.addEventListener("load", function (e) {
          e.target.style.width = window.innerWidth + "px";
          e.target.style.height = window.innerHeight + "px";
          e.target.style.minWidth = window.innerWidth + "px";
          e.target.style.maxWidth = window.innerWidth + "px";
          e.target.style.minHeight = window.innerHeight + "px";
          e.target.style.maxHeight = window.innerHeight + "px";
        });
        /*  */
        div.style.width = config.width + "px";
        div.style.height = config.height + "px";
        div.style.minWidth = config.width + "px";
        div.style.maxWidth = config.width + "px";
        div.style.minHeight = config.height + "px";
        div.style.maxHeight = config.height + "px";
        div.setAttribute("id", config.id.container);
        root.style.setProperty("--bcolor", config.color);
        div.style.transform = "scale(" + config.zoom + ")";
        /*  */
        if (config.state) {
          div.style.display = "block";
          img.style.top = (-1 * config.position.clientY + config.height / 2) + "px";
          img.style.left = (-1 * config.position.clientX + config.width / 2) + "px";
          div.style.top = (+1 * (config.position.clientY + window.scrollY) - config.height / 2) + "px";
          div.style.left = (+1 * (config.position.clientX + window.scrollX) - config.width / 2) + "px";
        } else {
          div.style.display = "none";
        }
        /*  */
        div.appendChild(img);
        document.body.appendChild(div);
      }
    }
  };

  document.addEventListener("keydown", config.keydown);
  document.addEventListener("mousemove", config.mousemove);
  document.addEventListener("click", function () {config.clear(true)});
  
  background.receive("screenshot", config.screenshot);
  background.receive("reset", function () {config.clear(false)});
  window.addEventListener("scroll", function () {config.clear(true)});
}
