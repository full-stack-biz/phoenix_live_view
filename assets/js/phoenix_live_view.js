var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(
      s ? "Object is not iterable." : "Symbol.iterator is not defined."
    );
  };
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  };
define("constants", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CONSECUTIVE_RELOADS = "consecutive-reloads";
  exports.MAX_RELOADS = 10;
  exports.RELOAD_JITTER = [1000, 3000];
  exports.FAILSAFE_JITTER = 30000;
  exports.PHX_VIEW = "data-phx-view";
  exports.PHX_EVENT_CLASSES = [
    "phx-click-loading",
    "phx-change-loading",
    "phx-submit-loading",
    "phx-keydown-loading",
    "phx-keyup-loading",
    "phx-blur-loading",
    "phx-focus-loading",
  ];
  exports.PHX_COMPONENT = "data-phx-component";
  exports.PHX_LIVE_LINK = "data-phx-link";
  exports.PHX_LINK_STATE = "data-phx-link-state";
  exports.PHX_REF = "data-phx-ref";
  exports.PHX_SKIP = "data-phx-skip";
  exports.PHX_REMOVE = "data-phx-remove";
  exports.PHX_PAGE_LOADING = "page-loading";
  exports.PHX_CONNECTED_CLASS = "phx-connected";
  exports.PHX_DISCONNECTED_CLASS = "phx-disconnected";
  exports.PHX_NO_FEEDBACK_CLASS = "phx-no-feedback";
  exports.PHX_ERROR_CLASS = "phx-error";
  exports.PHX_PARENT_ID = "data-phx-parent-id";
  exports.PHX_VIEW_SELECTOR = "[" + exports.PHX_VIEW + "]";
  exports.PHX_MAIN = "data-phx-main";
  exports.PHX_ROOT_ID = "data-phx-root-id";
  exports.PHX_TRIGGER_ACTION = "trigger-action";
  exports.PHX_FEEDBACK_FOR = "feedback-for";
  exports.PHX_HAS_FOCUSED = "phx-has-focused";
  exports.FOCUSABLE_INPUTS = [
    "text",
    "textarea",
    "number",
    "email",
    "password",
    "search",
    "tel",
    "url",
    "date",
    "time",
  ];
  exports.CHECKABLE_INPUTS = ["checkbox", "radio"];
  exports.PHX_HAS_SUBMITTED = "phx-has-submitted";
  exports.PHX_SESSION = "data-phx-session";
  exports.PHX_STATIC = "data-phx-static";
  exports.PHX_READONLY = "data-phx-readonly";
  exports.PHX_DISABLED = "data-phx-disabled";
  exports.PHX_DISABLE_WITH = "disable-with";
  exports.PHX_DISABLE_WITH_RESTORE = "data-phx-disable-with-restore";
  exports.PHX_HOOK = "hook";
  exports.PHX_DEBOUNCE = "debounce";
  exports.PHX_THROTTLE = "throttle";
  exports.PHX_CHANGE_EVENT = "phx-change";
  exports.PHX_UPDATE = "update";
  exports.PHX_KEY = "key";
  exports.PHX_PRIVATE = "phxPrivate";
  exports.PHX_AUTO_RECOVER = "auto-recover";
  exports.PHX_LV_DEBUG = "phx:live-socket:debug";
  exports.PHX_LV_PROFILE = "phx:live-socket:profiling";
  exports.PHX_LV_LATENCY_SIM = "phx:live-socket:latency-sim";
  exports.LOADER_TIMEOUT = 1;
  exports.BEFORE_UNLOAD_LOADER_TIMEOUT = 200;
  exports.BINDING_PREFIX = "phx-";
  exports.PUSH_TIMEOUT = 30000;
  exports.LINK_HEADER = "x-requested-with";
  exports.DEBOUNCE_BLUR = "debounce-blur";
  exports.DEBOUNCE_TIMER = "debounce-timer";
  exports.DEBOUNCE_BLUR_TIMER = "debounce-blur-timer";
  exports.DEBOUNCE_PREV_KEY = "debounce-prev-key";
  exports.DEFAULTS = {
    debounce: 300,
    throttle: 300,
  };
  // Rendered
  exports.DYNAMICS = "d";
  exports.STATIC = "s";
  exports.COMPONENTS = "c";
});
define("browser", ["require", "exports", "constants"], function (
  require,
  exports,
  constants_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Browser = {
    canPushState: function () {
      return typeof history.pushState !== "undefined";
    },
    dropLocal: function (namespace, subkey) {
      return window.localStorage.removeItem(this.localKey(namespace, subkey));
    },
    updateLocal: function (namespace, subkey, initial, func) {
      var current = this.getLocal(namespace, subkey);
      var key = this.localKey(namespace, subkey);
      var newVal = current === null ? initial : func(current);
      window.localStorage.setItem(key, JSON.stringify(newVal));
      return newVal;
    },
    getLocal: function (namespace, subkey) {
      return JSON.parse(
        window.localStorage.getItem(this.localKey(namespace, subkey))
      );
    },
    fetchPage: function (href, callback) {
      var req = new XMLHttpRequest();
      req.open("GET", href, true);
      req.timeout = constants_1.PUSH_TIMEOUT;
      req.setRequestHeader("content-type", "text/html");
      req.setRequestHeader(
        "cache-control",
        "max-age=0, no-cache, no-store, must-revalidate, post-check=0, pre-check=0"
      );
      req.setRequestHeader(constants_1.LINK_HEADER, "live-link");
      req.onerror = function () {
        return callback(400);
      };
      req.ontimeout = function () {
        return callback(504);
      };
      req.onreadystatechange = function () {
        if (req.readyState !== 4) {
          return;
        }
        if (req.getResponseHeader(constants_1.LINK_HEADER) !== "live-link") {
          return callback(400);
        }
        if (req.status !== 200) {
          return callback(req.status);
        }
        callback(200, req.responseText);
      };
      req.send();
    },
    pushState: function (kind, meta, to) {
      if (this.canPushState()) {
        if (to !== window.location.href) {
          history[kind + "State"](meta, "", to || null); // IE will coerce undefined to string
          var hashEl = this.getHashTargetEl(window.location.hash);
          if (hashEl) {
            hashEl.scrollIntoView();
          } else if (meta.type === "redirect") {
            window.scroll(0, 0);
          }
        }
      } else {
        this.redirect(to);
      }
    },
    setCookie: function (name, value) {
      document.cookie = name + "=" + value;
    },
    getCookie: function (name) {
      return document.cookie.replace(
        new RegExp("(?:(?:^|.*;s*)" + name + "s*=s*([^;]*).*$)|^.*$"),
        "$1"
      );
    },
    redirect: function (toURL, flash) {
      if (flash) {
        exports.Browser.setCookie(
          "__phoenix_flash__",
          flash + "; max-age=60000; path=/"
        );
      }
      window.location = toURL;
    },
    localKey: function (namespace, subkey) {
      return namespace + "-" + subkey;
    },
    getHashTargetEl: function (hash) {
      if (hash.toString() === "") {
        return;
      }
      return (
        document.getElementById(hash) ||
        document.querySelector('a[name="' + hash.substring(1) + '"]')
      );
    },
  };
});
define("util", ["require", "exports", "constants"], function (
  require,
  exports,
  constants_2
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.logError = function (msg, obj) {
    console.error && console.error(msg, obj);
    return undefined;
  };
  // wraps value in closure or returns closure
  exports.closure = function (val) {
    return typeof val === "function"
      ? val
      : function () {
          return val;
        };
  };
  exports.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  function detectDuplicateIds() {
    var ids = new Set();
    var elems = document.querySelectorAll("*[id]");
    for (var i = 0, len = elems.length; i < len; i++) {
      if (ids.has(elems[i].id)) {
        console.error(
          "Multiple IDs detected: " +
            elems[i].id +
            ". Ensure unique element ids."
        );
      } else {
        ids.add(elems[i].id);
      }
    }
  }
  exports.detectDuplicateIds = detectDuplicateIds;
  exports.maybe = function (el, callback) {
    return el && callback(el);
  };
  exports.isObject = function (obj) {
    return obj !== null && typeof obj === "object" && !(obj instanceof Array);
  };
  exports.isEqualObj = function (obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  exports.isEmpty = function (obj) {
    return Object.keys(obj).length == 0;
  };
  exports.serializeForm = function (form, meta) {
    var e_1, _a;
    if (meta === void 0) {
      meta = {};
    }
    var formData = new FormData(form);
    var params = new URLSearchParams();
    try {
      for (
        var _b = __values(formData.entries()), _c = _b.next();
        !_c.done;
        _c = _b.next()
      ) {
        var _d = __read(_c.value, 2),
          key = _d[0],
          val = _d[1];
        params.append(key, val.toString());
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    for (var metaKey in meta) {
      params.append(metaKey, meta[metaKey]);
    }
    return params.toString();
  };
  exports.closestPhxBinding = function (el, binding, borderEl) {
    do {
      if (el.matches("[" + binding + "]")) {
        return el;
      }
      el = el.parentElement || el.parentNode;
    } while (
      el !== null &&
      el.nodeType === 1 &&
      !(
        (borderEl && borderEl.isSameNode(el)) ||
        el.matches(constants_2.PHX_VIEW_SELECTOR)
      )
    );
    return null;
  };
});
define("dom", [
  "require",
  "exports",
  "constants",
  "morphdom",
  "util",
], function (require, exports, constants_3, morphdom, util_1) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DOM = {
    byId: function (id) {
      return (
        document.getElementById(id) || util_1.logError("no id found for " + id)
      );
    },
    removeClass: function (el, className) {
      el.classList.remove(className);
      if (el.classList.length === 0) {
        el.removeAttribute("class");
      }
    },
    all: function (node, query) {
      return Array.from(node.querySelectorAll(query));
    },
    each: function (node, query, callback) {
      this.all(node, query).forEach(callback);
    },
    findFirstComponentNode: function (node, cid) {
      return node.querySelector(
        "[" + constants_3.PHX_COMPONENT + '="' + cid + '"]'
      );
    },
    findComponentNodeList: function (node, cid) {
      return this.all(
        node,
        "[" + constants_3.PHX_COMPONENT + '="' + cid + '"]'
      );
    },
    findPhxChildrenInFragment: function (html, parentId) {
      var template = document.createElement("template");
      template.innerHTML = html;
      return this.findPhxChildren(template.content, parentId);
    },
    isPhxUpdate: function (el, phxUpdate, updateTypes) {
      return (
        el.getAttribute && updateTypes.indexOf(el.getAttribute(phxUpdate)) >= 0
      );
    },
    findPhxChildren: function (el, parentId) {
      return this.all(
        el,
        constants_3.PHX_VIEW_SELECTOR +
          "[" +
          constants_3.PHX_PARENT_ID +
          '="' +
          parentId +
          '"]'
      );
    },
    findParentCIDs: function (node, cids) {
      var _this = this;
      var initial = new Set(cids);
      return cids.reduce(function (acc, cid) {
        var selector =
          "[" +
          constants_3.PHX_COMPONENT +
          '="' +
          cid +
          '"] [' +
          constants_3.PHX_COMPONENT +
          "]";
        _this
          .all(node, selector)
          .map(function (el) {
            return parseInt(el.getAttribute(constants_3.PHX_COMPONENT));
          })
          .forEach(function (childCID) {
            return acc.delete(childCID);
          });
        return acc;
      }, initial);
    },
    private: function (el, key) {
      return el[constants_3.PHX_PRIVATE] && el[constants_3.PHX_PRIVATE][key];
    },
    deletePrivate: function (el, key) {
      el[constants_3.PHX_PRIVATE] && delete el[constants_3.PHX_PRIVATE][key];
    },
    putPrivate: function (el, key, value) {
      if (!el[constants_3.PHX_PRIVATE]) {
        el[constants_3.PHX_PRIVATE] = {};
      }
      el[constants_3.PHX_PRIVATE][key] = value;
    },
    copyPrivates: function (target, source) {
      if (source[constants_3.PHX_PRIVATE]) {
        target[constants_3.PHX_PRIVATE] = util_1.clone(
          source[constants_3.PHX_PRIVATE]
        );
      }
    },
    putTitle: function (str) {
      var titleEl = document.querySelector("title");
      var _a = titleEl.dataset,
        prefix = _a.prefix,
        suffix = _a.suffix;
      document.title = "" + (prefix || "") + str + (suffix || "");
    },
    debounce: function (
      el,
      event,
      phxDebounce,
      defaultDebounce,
      phxThrottle,
      defaultThrottle,
      callback
    ) {
      var _this = this;
      var debounce = el.getAttribute(phxDebounce);
      var throttle = el.getAttribute(phxThrottle);
      if (debounce === "") {
        debounce = defaultDebounce;
      }
      if (throttle === "") {
        throttle = defaultThrottle;
      }
      var value = debounce || throttle;
      switch (value) {
        case null: {
          return callback();
        }
        case "blur": {
          if (this.private(el, constants_3.DEBOUNCE_BLUR)) {
            return;
          }
          el.addEventListener("blur", function () {
            return callback();
          });
          this.putPrivate(el, constants_3.DEBOUNCE_BLUR, value);
          return;
        }
        default: {
          var timeout = parseInt(value);
          if (isNaN(timeout)) {
            return util_1.logError("invalid throttle/debounce value: " + value);
          }
          if (throttle && event.type === "keydown") {
            var prevKey = this.private(el, constants_3.DEBOUNCE_PREV_KEY);
            this.putPrivate(el, constants_3.DEBOUNCE_PREV_KEY, event.key);
            if (prevKey !== event.key) {
              return callback();
            }
          }
          if (this.private(el, constants_3.DEBOUNCE_TIMER)) {
            return;
          }
          var clearTimer_1 = function (e) {
            if (
              throttle &&
              e.type === constants_3.PHX_CHANGE_EVENT &&
              e.detail.triggeredBy.name === el.name
            ) {
              return;
            }
            clearTimeout(_this.private(el, constants_3.DEBOUNCE_TIMER));
            _this.deletePrivate(el, constants_3.DEBOUNCE_TIMER);
          };
          var debounceCallback_1 = function () {
            if (el.form) {
              el.form.removeEventListener(
                constants_3.PHX_CHANGE_EVENT,
                clearTimer_1
              );
              el.form.removeEventListener("submit", clearTimer_1);
            }
            el.removeEventListener(
              "blur",
              _this.private(el, constants_3.DEBOUNCE_BLUR_TIMER)
            );
            _this.deletePrivate(el, constants_3.DEBOUNCE_BLUR_TIMER);
            _this.deletePrivate(el, constants_3.DEBOUNCE_TIMER);
            if (!throttle) {
              callback();
            }
          };
          var blurCallback = function () {
            clearTimeout(_this.private(el, constants_3.DEBOUNCE_TIMER));
            debounceCallback_1();
          };
          this.putPrivate(
            el,
            constants_3.DEBOUNCE_TIMER,
            setTimeout(debounceCallback_1, timeout)
          );
          el.addEventListener("blur", blurCallback);
          this.putPrivate(el, constants_3.DEBOUNCE_BLUR_TIMER, blurCallback);
          if (el.form) {
            el.form.addEventListener(
              constants_3.PHX_CHANGE_EVENT,
              clearTimer_1
            );
            el.form.addEventListener("submit", clearTimer_1);
          }
          if (throttle) {
            callback();
          }
        }
      }
    },
    discardError: function (container, el, phxFeedbackFor) {
      var field = el.getAttribute && el.getAttribute(phxFeedbackFor);
      var input = field && container.querySelector("#" + field);
      if (!input) {
        return;
      }
      if (
        !(
          this.private(input, constants_3.PHX_HAS_FOCUSED) ||
          this.private(input.form, constants_3.PHX_HAS_SUBMITTED)
        )
      ) {
        el.classList.add(constants_3.PHX_NO_FEEDBACK_CLASS);
      }
    },
    isPhxChild: function (node) {
      return node.getAttribute && node.getAttribute(constants_3.PHX_PARENT_ID);
    },
    dispatchEvent: function (target, eventString, detail) {
      if (detail === void 0) {
        detail = {};
      }
      var event = new CustomEvent(eventString, {
        bubbles: true,
        cancelable: true,
        detail: detail,
      });
      target.dispatchEvent(event);
    },
    cloneNode: function (node, html) {
      if (typeof html === "undefined") {
        return node.cloneNode(true);
      } else {
        var cloned = node.cloneNode(false);
        cloned.innerHTML = html;
        return cloned;
      }
    },
    mergeAttrs: function (target, source, exclude) {
      if (exclude === void 0) {
        exclude = [];
      }
      var sourceAttrs = source.attributes;
      for (var i = sourceAttrs.length - 1; i >= 0; i--) {
        var name_1 = sourceAttrs[i].name;
        if (exclude.indexOf(name_1) < 0) {
          target.setAttribute(name_1, source.getAttribute(name_1));
        }
      }
      var targetAttrs = target.attributes;
      for (var i = targetAttrs.length - 1; i >= 0; i--) {
        var name_2 = targetAttrs[i].name;
        if (!source.hasAttribute(name_2)) {
          target.removeAttribute(name_2);
        }
      }
    },
    mergeFocusedInput: function (target, source) {
      // skip selects because FF will reset highlighted index for any setAttribute
      if (!(target instanceof HTMLSelectElement)) {
        exports.DOM.mergeAttrs(target, source, ["value"]);
      }
      if (source.readOnly) {
        target.setAttribute("readonly", "true");
      } else {
        target.removeAttribute("readonly");
      }
    },
    restoreFocus: function (focused, selectionStart, selectionEnd) {
      if (!exports.DOM.isTextualInput(focused)) {
        return;
      }
      var wasFocused = focused.matches(":focus");
      if (focused.readOnly) {
        focused.blur();
      }
      if (!wasFocused) {
        focused.focus();
      }
      if (
        (focused.setSelectionRange && focused.type === "text") ||
        focused.type === "textarea"
      ) {
        focused.setSelectionRange(selectionStart, selectionEnd);
      }
    },
    isFormInput: function (el) {
      return /^(?:input|select|textarea)$/i.test(el.tagName);
    },
    syncAttrsToProps: function (el) {
      if (
        el instanceof HTMLInputElement &&
        constants_3.CHECKABLE_INPUTS.indexOf(el.type.toLocaleLowerCase()) >= 0
      ) {
        el.checked = el.getAttribute("checked") !== null;
      }
    },
    isTextualInput: function (el) {
      return constants_3.FOCUSABLE_INPUTS.indexOf(el.type) >= 0;
    },
    isNowTriggerFormExternal: function (el, phxTriggerExternal) {
      return el.getAttribute && el.getAttribute(phxTriggerExternal) !== null;
    },
    undoRefs: function (ref, container) {
      var _this = this;
      exports.DOM.each(container, "[" + constants_3.PHX_REF + "]", function (
        el
      ) {
        return _this.syncPendingRef(ref, el, el);
      });
    },
    syncPendingRef: function (ref, fromEl, toEl) {
      var fromRefAttr =
        fromEl.getAttribute && fromEl.getAttribute(constants_3.PHX_REF);
      if (fromRefAttr === null) {
        return true;
      }
      var fromRef = parseInt(fromRefAttr);
      if (ref !== null && ref >= fromRef) {
        [fromEl, toEl].forEach(function (el) {
          // remove refs
          el.removeAttribute(constants_3.PHX_REF);
          // retore inputs
          if (el.getAttribute(constants_3.PHX_READONLY) !== null) {
            el.readOnly = false;
            el.removeAttribute(constants_3.PHX_READONLY);
          }
          if (el.getAttribute(constants_3.PHX_DISABLED) !== null) {
            el.disabled = false;
            el.removeAttribute(constants_3.PHX_DISABLED);
          }
          // remove classes
          constants_3.PHX_EVENT_CLASSES.forEach(function (className) {
            return exports.DOM.removeClass(el, className);
          });
          // restore disables
          var disableRestore = el.getAttribute(
            constants_3.PHX_DISABLE_WITH_RESTORE
          );
          if (disableRestore !== null) {
            el.innerText = disableRestore;
            el.removeAttribute(constants_3.PHX_DISABLE_WITH_RESTORE);
          }
        });
        return true;
      } else {
        constants_3.PHX_EVENT_CLASSES.forEach(function (className) {
          fromEl.classList.contains(className) && toEl.classList.add(className);
        });
        toEl.setAttribute(
          constants_3.PHX_REF,
          fromEl.getAttribute(constants_3.PHX_REF)
        );
        return !(
          exports.DOM.isFormInput(fromEl) || /submit/i.test(fromEl.type)
        );
      }
    },
  };
  var DOMPatch = /** @class */ (function () {
    function DOMPatch(view, container, id, html, targetCID, ref) {
      this.view = view;
      this.liveSocket = view.liveSocket;
      this.container = container;
      this.id = id;
      this.rootID = view.root.id;
      this.html = html;
      this.targetCID = targetCID;
      this.ref = ref;
      this.cidPatch = typeof this.targetCID === "number";
      this.callbacks = {
        beforeadded: [],
        beforeupdated: [],
        beforediscarded: [],
        beforephxChildAdded: [],
        afteradded: [],
        afterupdated: [],
        afterdiscarded: [],
        afterphxChildAdded: [],
      };
    }
    DOMPatch.prototype.before = function (kind, callback) {
      this.callbacks["before" + kind].push(callback);
    };
    DOMPatch.prototype.after = function (kind, callback) {
      this.callbacks["after" + kind].push(callback);
    };
    DOMPatch.prototype.trackBefore = function (kind) {
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      this.callbacks["before" + kind].forEach(function (callback) {
        return callback.apply(void 0, __spread(args));
      });
    };
    DOMPatch.prototype.trackAfter = function (kind) {
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      this.callbacks["after" + kind].forEach(function (callback) {
        return callback.apply(void 0, __spread(args));
      });
    };
    DOMPatch.prototype.markPrunableContentForRemoval = function () {
      exports.DOM.each(
        this.container,
        "[phx-update=append] > *, [phx-update=prepend] > *",
        function (el) {
          el.setAttribute(constants_3.PHX_REMOVE, "");
        }
      );
    };
    DOMPatch.prototype.perform = function () {
      var _this = this;
      var _a = this,
        view = _a.view,
        liveSocket = _a.liveSocket,
        container = _a.container,
        html = _a.html;
      var targetContainer = this.isCIDPatch()
        ? this.targetCIDContainer()
        : container;
      if (this.isCIDPatch() && !targetContainer) {
        return;
      }
      var focused = liveSocket.getActiveElement();
      var selectionStart = focused.selectionStart,
        selectionEnd = focused.selectionEnd;
      var phxUpdate = liveSocket.binding(constants_3.PHX_UPDATE);
      var phxFeedbackFor = liveSocket.binding(constants_3.PHX_FEEDBACK_FOR);
      var phxTriggerExternal = liveSocket.binding(
        constants_3.PHX_TRIGGER_ACTION
      );
      var added = [];
      var updates = [];
      var appendPrependUpdates = [];
      var diffHTML = liveSocket.time("premorph container prep", function () {
        return _this.buildDiffHTML(container, html, phxUpdate, targetContainer);
      });
      this.trackBefore("added", container);
      this.trackBefore("updated", container, container);
      liveSocket.time("morphdom", function () {
        morphdom(targetContainer, diffHTML, {
          childrenOnly:
            targetContainer.getAttribute(constants_3.PHX_COMPONENT) === null,
          onBeforeNodeAdded: function (el) {
            //input handling
            exports.DOM.discardError(targetContainer, el, phxFeedbackFor);
            _this.trackBefore("added", el);
            return el;
          },
          onNodeAdded: function (el) {
            if (exports.DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
              el.submit();
            }
            // nested view handling
            if (exports.DOM.isPhxChild(el) && view.ownsElement(el)) {
              _this.trackAfter("phxChildAdded", el);
            }
            added.push(el);
            return el;
          },
          onNodeDiscarded: function (el) {
            _this.trackAfter("discarded", el);
          },
          onBeforeNodeDiscarded: function (el) {
            if (
              el.getAttribute &&
              el.getAttribute(constants_3.PHX_REMOVE) !== null
            ) {
              return true;
            }
            if (
              exports.DOM.isPhxUpdate(el.parentNode, phxUpdate, [
                "append",
                "prepend",
              ])
            ) {
              return false;
            }
            if (_this.skipCIDSibling(el)) {
              return false;
            }
            _this.trackBefore("discarded", el);
            // nested view handling
            if (exports.DOM.isPhxChild(el)) {
              liveSocket.destroyViewByEl(el);
              return true;
            }
          },
          onElUpdated: function (el) {
            if (exports.DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
              el.submit();
            }
            updates.push(el);
          },
          onBeforeElUpdated: function (fromEl, toEl) {
            if (_this.skipCIDSibling(toEl)) {
              return false;
            }
            if (fromEl.getAttribute(phxUpdate) === "ignore") {
              _this.trackBefore("updated", fromEl, toEl);
              exports.DOM.mergeAttrs(fromEl, toEl);
              updates.push(fromEl);
              return false;
            }
            if (
              fromEl.type === "number" &&
              fromEl.validity &&
              fromEl.validity.badInput
            ) {
              return false;
            }
            if (!exports.DOM.syncPendingRef(_this.ref, fromEl, toEl)) {
              return false;
            }
            // nested view handling
            if (exports.DOM.isPhxChild(toEl)) {
              var prevStatic = fromEl.getAttribute(constants_3.PHX_STATIC);
              exports.DOM.mergeAttrs(fromEl, toEl);
              fromEl.setAttribute(constants_3.PHX_STATIC, prevStatic);
              fromEl.setAttribute(constants_3.PHX_ROOT_ID, _this.rootID);
              return false;
            }
            // input handling
            exports.DOM.copyPrivates(toEl, fromEl);
            exports.DOM.discardError(targetContainer, toEl, phxFeedbackFor);
            var isFocusedFormEl =
              focused &&
              fromEl.isSameNode(focused) &&
              exports.DOM.isFormInput(fromEl);
            if (
              isFocusedFormEl &&
              !_this.forceFocusedSelectUpdate(fromEl, toEl)
            ) {
              _this.trackBefore("updated", fromEl, toEl);
              exports.DOM.mergeFocusedInput(fromEl, toEl);
              exports.DOM.syncAttrsToProps(fromEl);
              updates.push(fromEl);
              return false;
            } else {
              // we optimize append/prepend operations in two ways:
              //   1) By tracking the previously appended ids. If the ids don't
              //     change b/w patches, we know that we are going to re-arrange
              //     the same appendPrependUpdates so we can skip the post-morph
              //     append/prepend ops.
              //   2) for appends, we can skip post-morph re-arranging if the
              //     new content contains only new ids, because it will simply
              //     be appended to the container
              if (
                exports.DOM.isPhxUpdate(toEl, phxUpdate, ["append", "prepend"])
              ) {
                var isAppend = toEl.getAttribute(phxUpdate) === "append";
                var idsBefore_1 = Array.from(fromEl.children).map(function (
                  child
                ) {
                  return child.id;
                });
                var newIds = Array.from(toEl.children).map(function (child) {
                  return child.id;
                });
                var isOnlyNewIds =
                  isAppend &&
                  !newIds.find(function (id) {
                    return idsBefore_1.indexOf(id) >= 0;
                  });
                if (!isOnlyNewIds) {
                  appendPrependUpdates.push([toEl.id, idsBefore_1]);
                }
              }
              exports.DOM.syncAttrsToProps(toEl);
              _this.trackBefore("updated", fromEl, toEl);
              return true;
            }
          },
        });
      });
      if (liveSocket.isDebugEnabled()) {
        util_1.detectDuplicateIds();
      }
      if (appendPrependUpdates.length > 0) {
        liveSocket.time("post-morph append/prepend restoration", function () {
          appendPrependUpdates.forEach(function (_a) {
            var _b = __read(_a, 2),
              containerID = _b[0],
              idsBefore = _b[1];
            var el = exports.DOM.byId(containerID);
            var isAppend =
              (el === null || el === void 0
                ? void 0
                : el.getAttribute(phxUpdate)) === "append";
            if (isAppend) {
              idsBefore.reverse().forEach(function (id) {
                util_1.maybe(document.getElementById(id), function (child) {
                  return el.insertBefore(child, el.firstChild);
                });
              });
            } else {
              idsBefore.forEach(function (id) {
                util_1.maybe(document.getElementById(id), function (child) {
                  return el.appendChild(child);
                });
              });
            }
          });
        });
      }
      liveSocket.silenceEvents(function () {
        return exports.DOM.restoreFocus(focused, selectionStart, selectionEnd);
      });
      exports.DOM.dispatchEvent(document, "phx:update");
      added.forEach(function (el) {
        return _this.trackAfter("added", el);
      });
      updates.forEach(function (el) {
        return _this.trackAfter("updated", el);
      });
      return true;
    };
    DOMPatch.prototype.forceFocusedSelectUpdate = function (fromEl, toEl) {
      return fromEl.multiple === true || fromEl.innerHTML != toEl.innerHTML;
    };
    DOMPatch.prototype.isCIDPatch = function () {
      return this.cidPatch;
    };
    DOMPatch.prototype.skipCIDSibling = function (el) {
      return (
        el.nodeType === Node.ELEMENT_NODE &&
        el.getAttribute(constants_3.PHX_SKIP) !== null
      );
    };
    DOMPatch.prototype.targetCIDContainer = function () {
      if (!this.isCIDPatch()) {
        return;
      }
      var _a = __read(
          exports.DOM.findComponentNodeList(this.container, this.targetCID)
        ),
        first = _a[0],
        rest = _a.slice(1);
      if (rest.length === 0) {
        return first;
      } else {
        return first && first.parentNode;
      }
    };
    // builds HTML for morphdom patch
    // - for full patches of LiveView or a component with a single
    //   root node, simply returns the HTML
    // - for patches of a component with multiple root nodes, the
    //   parent node becomes the target container and non-component
    //   siblings are marked as skip.
    DOMPatch.prototype.buildDiffHTML = function (
      container,
      html,
      phxUpdate,
      targetContainer
    ) {
      var _this = this;
      var isCIDPatch = this.isCIDPatch();
      var isCIDWithSingleRoot =
        isCIDPatch &&
        targetContainer.getAttribute(constants_3.PHX_COMPONENT) ===
          this.targetCID.toString();
      if (!isCIDPatch || isCIDWithSingleRoot) {
        return html;
      } else {
        // component patch with multiple CID roots
        var diffContainer_1 = null;
        var template = document.createElement("template");
        diffContainer_1 = exports.DOM.cloneNode(targetContainer);
        var _a = __read(
            exports.DOM.findComponentNodeList(diffContainer_1, this.targetCID)
          ),
          firstComponent_1 = _a[0],
          rest = _a.slice(1);
        template.innerHTML = html;
        rest.forEach(function (el) {
          return el.remove();
        });
        Array.from(diffContainer_1.childNodes).forEach(function (child) {
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            child.getAttribute(constants_3.PHX_COMPONENT) !==
              _this.targetCID.toString()
          ) {
            child.setAttribute(constants_3.PHX_SKIP, "");
            child.innerHTML = "";
          }
        });
        Array.from(template.content.childNodes).forEach(function (el) {
          return diffContainer_1.insertBefore(el, firstComponent_1);
        });
        firstComponent_1.remove();
        return diffContainer_1.outerHTML;
      }
    };
    return DOMPatch;
  })();
  exports.DOMPatch = DOMPatch;
});
define("rendered", ["require", "exports", "constants", "util"], function (
  require,
  exports,
  constants_4,
  util_2
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var Rendered = /** @class */ (function () {
    function Rendered(viewId, rendered) {
      this.viewId = viewId;
      this.replaceRendered(rendered);
    }
    Rendered.prototype.parentViewId = function () {
      return this.viewId;
    };
    Rendered.prototype.toString = function (onlyCids) {
      return this.recursiveToString(
        this.rendered,
        this.rendered[constants_4.COMPONENTS],
        onlyCids
      );
    };
    Rendered.prototype.recursiveToString = function (
      rendered,
      components,
      onlyCids
    ) {
      if (components === void 0) {
        components = rendered[constants_4.COMPONENTS] || {};
      }
      onlyCids = onlyCids ? new Set(onlyCids) : null;
      var output = { buffer: "", components: components, onlyCids: onlyCids };
      this.toOutputBuffer(rendered, output);
      return output.buffer;
    };
    Rendered.prototype.componentCIDs = function (diff) {
      return Object.keys(diff[constants_4.COMPONENTS] || {}).map(function (i) {
        return parseInt(i);
      });
    };
    Rendered.prototype.isComponentOnlyDiff = function (diff) {
      if (!diff[constants_4.COMPONENTS]) {
        return false;
      }
      return (
        Object.keys(diff).filter(function (k) {
          return k !== "title" && k !== constants_4.COMPONENTS;
        }).length === 0
      );
    };
    Rendered.prototype.mergeDiff = function (diff) {
      if (!diff[constants_4.COMPONENTS] && this.isNewFingerprint(diff)) {
        this.replaceRendered(diff);
      } else {
        this.recursiveMerge(this.rendered, diff);
      }
    };
    Rendered.prototype.recursiveMerge = function (target, source) {
      var _this = this;
      Object.keys(source).forEach(function (key) {
        var val = source[key];
        var targetVal = target[key];
        if (util_2.isObject(val) && util_2.isObject(targetVal)) {
          if (targetVal[constants_4.DYNAMICS] && !val[constants_4.DYNAMICS]) {
            delete targetVal[constants_4.DYNAMICS];
          }
          _this.recursiveMerge(targetVal, val);
        } else {
          target[key] = val;
        }
      });
    };
    Rendered.prototype.componentToString = function (cid) {
      return this.recursiveCIDToString(
        this.rendered[constants_4.COMPONENTS],
        cid
      );
    };
    Rendered.prototype.pruneCIDs = function (cids) {
      var _this = this;
      cids.forEach(function (cid) {
        return delete _this.rendered[constants_4.COMPONENTS][cid];
      });
    };
    // private
    Rendered.prototype.get = function () {
      return this.rendered;
    };
    Rendered.prototype.replaceRendered = function (rendered) {
      this.rendered = rendered;
      this.rendered[constants_4.COMPONENTS] =
        this.rendered[constants_4.COMPONENTS] || {};
    };
    Rendered.prototype.isNewFingerprint = function (diff) {
      if (diff === void 0) {
        diff = {};
      }
      return !!diff[constants_4.STATIC];
    };
    Rendered.prototype.toOutputBuffer = function (rendered, output) {
      if (rendered[constants_4.DYNAMICS]) {
        return this.comprehensionToBuffer(rendered, output);
      }
      var _a = rendered,
        _b = constants_4.STATIC,
        statics = _a[_b];
      output.buffer += statics[0];
      for (var i = 1; i < statics.length; i++) {
        this.dynamicToBuffer(rendered[i - 1], output);
        output.buffer += statics[i];
      }
    };
    Rendered.prototype.comprehensionToBuffer = function (rendered, output) {
      var _a = rendered,
        _b = constants_4.DYNAMICS,
        dynamics = _a[_b],
        _c = constants_4.STATIC,
        statics = _a[_c];
      for (var d = 0; d < dynamics.length; d++) {
        var dynamic = dynamics[d];
        output.buffer += statics[0];
        for (var i = 1; i < statics.length; i++) {
          this.dynamicToBuffer(dynamic[i - 1], output);
          output.buffer += statics[i];
        }
      }
    };
    Rendered.prototype.dynamicToBuffer = function (rendered, output) {
      if (typeof rendered === "number") {
        output.buffer += this.recursiveCIDToString(
          output.components,
          rendered,
          output.onlyCids
        );
      } else if (util_2.isObject(rendered)) {
        this.toOutputBuffer(rendered, output);
      } else {
        output.buffer += rendered;
      }
    };
    Rendered.prototype.recursiveCIDToString = function (
      components,
      cid,
      onlyCids
    ) {
      var _this = this;
      var component =
        components[cid] ||
        util_2.logError("no component for CID " + cid, components);
      var template = document.createElement("template");
      template.innerHTML = this.recursiveToString(
        component,
        components,
        onlyCids
      );
      var container = template.content;
      var skip = onlyCids && !onlyCids.has(cid);
      Array.from(container.children).forEach(function (child, i) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          child.setAttribute(constants_4.PHX_COMPONENT, cid);
          if (!child.id) {
            child.id = _this.parentViewId() + "-" + cid + "-" + i;
          }
          if (skip) {
            child.setAttribute(constants_4.PHX_SKIP, "");
            child.innerHTML = "";
          }
        } else {
          if (child.nodeValue.trim() !== "") {
            util_2.logError(
              "only HTML element tags are allowed at the root of components.\n\n" +
                ('got: "' + child.nodeValue.trim() + '"\n\n') +
                "within:\n",
              template.innerHTML.trim()
            );
            var span = document.createElement("span");
            span.innerText = child.nodeValue;
            span.setAttribute(constants_4.PHX_COMPONENT, cid);
            child.replaceWith(span);
          } else {
            child.remove();
          }
        }
      });
      return template.innerHTML;
    };
    return Rendered;
  })();
  exports.Rendered = Rendered;
});
define("view", [
  "require",
  "exports",
  "constants",
  "dom",
  "browser",
  "util",
  "rendered",
], function (
  require,
  exports,
  constants_5,
  dom_1,
  browser_1,
  util_3,
  rendered_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var View = /** @class */ (function () {
    function View(el, liveSocket, parentView, href, flash) {
      var _this = this;
      this.liveSocket = liveSocket;
      this.flash = flash;
      this.parent = parentView;
      this.root = parentView ? parentView.root : this;
      this.el = el;
      this.id = this.el.id;
      this.view = this.el.getAttribute(constants_5.PHX_VIEW);
      this.ref = 0;
      this.childJoins = 0;
      this.loaderTimer = null;
      this.pendingDiffs = [];
      this.href = href;
      this.joinCount = this.parent ? this.parent.joinCount - 1 : 0;
      this.joinPending = true;
      this.destroyed = false;
      this.joinCallback = function () {};
      this.stopCallback = function () {};
      this.pendingJoinOps = this.parent ? null : [];
      this.viewHooks = {};
      this.children = this.parent ? null : {};
      this.root.children[this.id] = {};
      this.channel = this.liveSocket.channel("lv:" + this.id, function () {
        return {
          url: _this.href,
          params: _this.liveSocket.params(_this.view),
          session: _this.getSession(),
          static: _this.getStatic(),
          flash: _this.flash,
          joins: _this.joinCount,
        };
      });
      this.showLoader(this.liveSocket.loaderTimeout);
      this.bindChannel();
    }
    View.prototype.isMain = function () {
      return this.liveSocket.main === this;
    };
    View.prototype.name = function () {
      return this.view;
    };
    View.prototype.isConnected = function () {
      return this.channel.canPush();
    };
    View.prototype.getSession = function () {
      return this.el.getAttribute(constants_5.PHX_SESSION);
    };
    View.prototype.getStatic = function () {
      var val = this.el.getAttribute(constants_5.PHX_STATIC);
      return val === "" ? null : val;
    };
    View.prototype.destroy = function (callback) {
      var _this = this;
      if (callback === void 0) {
        callback = function () {};
      }
      this.destroyAllChildren();
      this.destroyed = true;
      delete this.root.children[this.id];
      if (this.parent) {
        delete this.root.children[this.parent.id][this.id];
      }
      clearTimeout(this.loaderTimer);
      var onFinished = function () {
        callback();
        for (var id in _this.viewHooks) {
          _this.destroyHook(_this.viewHooks[id]);
        }
      };
      this.log("destroyed", function () {
        return ["the child has been removed from the parent"];
      });
      this.channel
        .leave()
        .receive("ok", onFinished)
        .receive("error", onFinished)
        .receive("timeout", onFinished);
    };
    View.prototype.setContainerClasses = function () {
      var _a;
      var classes = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
      }
      this.el.classList.remove(
        constants_5.PHX_CONNECTED_CLASS,
        constants_5.PHX_DISCONNECTED_CLASS,
        constants_5.PHX_ERROR_CLASS
      );
      (_a = this.el.classList).add.apply(_a, __spread(classes));
    };
    View.prototype.isLoading = function () {
      return this.el.classList.contains(constants_5.PHX_DISCONNECTED_CLASS);
    };
    View.prototype.showLoader = function (timeout) {
      var _this = this;
      clearTimeout(this.loaderTimer);
      if (timeout) {
        this.loaderTimer = window.setTimeout(function () {
          return _this.showLoader();
        }, timeout);
      } else {
        for (var id in this.viewHooks) {
          this.viewHooks[id].__trigger__("disconnected");
        }
        this.setContainerClasses(constants_5.PHX_DISCONNECTED_CLASS);
      }
    };
    View.prototype.hideLoader = function () {
      clearTimeout(this.loaderTimer);
      this.setContainerClasses(constants_5.PHX_CONNECTED_CLASS);
    };
    View.prototype.triggerReconnected = function () {
      for (var id in this.viewHooks) {
        this.viewHooks[id].__trigger__("reconnected");
      }
    };
    View.prototype.log = function (kind, msgCallback) {
      this.liveSocket.log(this, kind, msgCallback);
    };
    View.prototype.onJoin = function (resp) {
      var _this = this;
      var rendered = resp.rendered;
      this.joinCount++;
      this.childJoins = 0;
      this.joinPending = true;
      this.flash = null;
      this.log("join", function () {
        return ["", rendered];
      });
      if (rendered.title) {
        dom_1.DOM.putTitle(rendered.title);
      }
      browser_1.Browser.dropLocal(this.name(), constants_5.CONSECUTIVE_RELOADS);
      this.rendered = new rendered_1.Rendered(this.id, rendered);
      var html = this.renderContainer(null, "join");
      this.dropPendingRefs();
      var forms = this.formsForRecovery(html);
      if (this.joinCount > 1 && forms.length > 0) {
        forms.forEach(function (form, i) {
          _this.pushFormRecovery(form, function (resp) {
            if (i === forms.length - 1) {
              _this.onJoinComplete(resp, html);
            }
          });
        });
      } else {
        this.onJoinComplete(resp, html);
      }
    };
    View.prototype.dropPendingRefs = function () {
      dom_1.DOM.each(this.el, "[" + constants_5.PHX_REF + "]", function (el) {
        return el.removeAttribute(constants_5.PHX_REF);
      });
    };
    View.prototype.onJoinComplete = function (_a, html) {
      var _this = this;
      var live_patch = _a.live_patch;
      if (this.joinCount > 1 || (this.parent && !this.parent.isJoinPending())) {
        return this.applyJoinPatch(live_patch, html);
      }
      var newChildren = dom_1.DOM.findPhxChildrenInFragment(
        html,
        this.id
      ).filter(function (c) {
        return _this.joinChild(c);
      });
      if (newChildren.length === 0) {
        if (this.parent) {
          this.root.pendingJoinOps.push([
            this,
            function () {
              return _this.applyJoinPatch(live_patch, html);
            },
          ]);
          this.parent.ackJoin(this);
        } else {
          this.onAllChildJoinsComplete();
          this.applyJoinPatch(live_patch, html);
        }
      } else {
        this.root.pendingJoinOps.push([
          this,
          function () {
            return _this.applyJoinPatch(live_patch, html);
          },
        ]);
      }
    };
    View.prototype.attachTrueDocEl = function () {
      this.el = dom_1.DOM.byId(this.id);
      this.el.setAttribute(constants_5.PHX_ROOT_ID, this.root.id);
    };
    View.prototype.applyJoinPatch = function (live_patch, html) {
      var _this = this;
      this.attachTrueDocEl();
      var patch = new dom_1.DOMPatch(this, this.el, this.id, html, null);
      patch.markPrunableContentForRemoval();
      this.joinPending = false;
      this.performPatch(patch);
      this.joinNewChildren();
      dom_1.DOM.each(
        this.el,
        "[" + this.binding(constants_5.PHX_HOOK) + "]",
        function (hookEl) {
          var hook = _this.addHook(hookEl);
          if (hook) {
            hook.__trigger__("mounted");
          }
        }
      );
      this.applyPendingUpdates();
      if (live_patch) {
        var kind = live_patch.kind,
          to = live_patch.to;
        this.liveSocket.historyPatch(to, kind);
      }
      this.hideLoader();
      if (this.joinCount > 1) {
        this.triggerReconnected();
      }
      this.stopCallback();
    };
    View.prototype.performPatch = function (patch) {
      var _this = this;
      var destroyedCIDs = [];
      var phxChildrenAdded = false;
      var updatedHookIds = new Set();
      patch.after("added", function (el) {
        var newHook = _this.addHook(el);
        if (newHook) {
          newHook.__trigger__("mounted");
        }
      });
      patch.after("phxChildAdded", function () {
        return (phxChildrenAdded = true);
      });
      patch.before("updated", function (fromEl, toEl) {
        var hook = _this.getHook(fromEl);
        var isIgnored =
          hook &&
          fromEl.getAttribute(_this.binding(constants_5.PHX_UPDATE)) ===
            "ignore";
        if (
          hook &&
          !fromEl.isEqualNode(toEl) &&
          !(isIgnored && util_3.isEqualObj(fromEl.dataset, toEl.dataset))
        ) {
          updatedHookIds.add(fromEl.id);
          hook.__trigger__("beforeUpdate");
        }
      });
      patch.after("updated", function (el) {
        var hook = _this.getHook(el);
        if (hook && updatedHookIds.has(el.id)) {
          hook.__trigger__("updated");
        }
      });
      patch.before("discarded", function (el) {
        var hook = _this.getHook(el);
        if (hook) {
          hook.__trigger__("beforeDestroy");
        }
      });
      patch.after("discarded", function (el) {
        var cid = _this.componentID(el);
        if (typeof cid === "number" && destroyedCIDs.indexOf(cid) === -1) {
          destroyedCIDs.push(cid);
        }
        var hook = _this.getHook(el);
        hook && _this.destroyHook(hook);
      });
      patch.perform();
      this.maybePushComponentsDestroyed(destroyedCIDs);
      return phxChildrenAdded;
    };
    View.prototype.joinNewChildren = function () {
      var _this = this;
      dom_1.DOM.findPhxChildren(this.el, this.id).forEach(function (el) {
        return _this.joinChild(el);
      });
    };
    View.prototype.getChildById = function (id) {
      return this.root.children[this.id][id];
    };
    View.prototype.getDescendentByEl = function (el) {
      if (el.id === this.id) {
        return this;
      } else {
        return this.children[el.getAttribute(constants_5.PHX_PARENT_ID)][el.id];
      }
    };
    View.prototype.destroyDescendent = function (id) {
      var _this = this;
      Object.keys(this.root.children).forEach(function (parentId) {
        Object.keys(_this.root.children[parentId]).forEach(function (childId) {
          if (childId === id) {
            return _this.root.children[parentId][childId].destroy();
          }
        });
      });
    };
    View.prototype.joinChild = function (el) {
      var child = this.getChildById(el.id);
      if (!child) {
        var view = new View(el, this.liveSocket, this);
        this.root.children[this.id][view.id] = view;
        view.join();
        this.childJoins++;
        return true;
      }
    };
    View.prototype.isJoinPending = function () {
      return this.joinPending;
    };
    View.prototype.ackJoin = function (_child) {
      this.childJoins--;
      if (this.childJoins === 0) {
        if (this.parent) {
          this.parent.ackJoin(this);
        } else {
          this.onAllChildJoinsComplete();
        }
      }
    };
    View.prototype.onAllChildJoinsComplete = function () {
      this.joinCallback();
      this.pendingJoinOps.forEach(function (_a) {
        var _b = __read(_a, 2),
          view = _b[0],
          op = _b[1];
        if (!view.isDestroyed()) {
          op();
        }
      });
      this.pendingJoinOps = [];
    };
    View.prototype.update = function (diff, cidAck, ref) {
      var _this = this;
      if (util_3.isEmpty(diff) && ref === null) {
        return;
      }
      if (diff.title) {
        dom_1.DOM.putTitle(diff.title);
      }
      if (this.isJoinPending() || this.liveSocket.hasPendingLink()) {
        return this.pendingDiffs.push({ diff: diff, cid: cidAck, ref: ref });
      }
      this.log("update", function () {
        return ["", diff];
      });
      this.rendered.mergeDiff(diff);
      var phxChildrenAdded = false;
      // when we don't have an acknowledgement CID and the diff only contains
      // component diffs, then walk components and patch only the parent component
      // containers found in the diff. Otherwise, patch entire LV container.
      if (typeof cidAck === "number") {
        this.liveSocket.time("component ack patch complete", function () {
          if (
            _this.componentPatch(
              diff[constants_5.COMPONENTS][cidAck],
              cidAck,
              ref
            )
          ) {
            phxChildrenAdded = true;
          }
        });
      } else if (this.rendered.isComponentOnlyDiff(diff)) {
        this.liveSocket.time("component patch complete", function () {
          var parentCids = dom_1.DOM.findParentCIDs(
            _this.el,
            _this.rendered.componentCIDs(diff)
          );
          parentCids.forEach(function (parentCID) {
            if (
              _this.componentPatch(
                diff[constants_5.COMPONENTS][parentCID],
                parentCID,
                ref
              )
            ) {
              phxChildrenAdded = true;
            }
          });
        });
      } else if (!util_3.isEmpty(diff)) {
        this.liveSocket.time("full patch complete", function () {
          var html = _this.renderContainer(diff, "update");
          var patch = new dom_1.DOMPatch(
            _this,
            _this.el,
            _this.id,
            html,
            null,
            ref
          );
          phxChildrenAdded = _this.performPatch(patch);
        });
      }
      dom_1.DOM.undoRefs(ref, this.el);
      if (phxChildrenAdded) {
        this.joinNewChildren();
      }
    };
    View.prototype.renderContainer = function (diff, kind) {
      var _this = this;
      return this.liveSocket.time("toString diff (" + kind + ")", function () {
        var tag = _this.el.tagName;
        var cids = diff ? _this.rendered.componentCIDs(diff) : null;
        var html = _this.rendered.toString(cids);
        return "<" + tag + ">" + html + "</" + tag + ">";
      });
    };
    View.prototype.componentPatch = function (diff, cid, ref) {
      if (util_3.isEmpty(diff)) return false;
      var html = this.rendered.componentToString(cid);
      var patch = new dom_1.DOMPatch(this, this.el, this.id, html, cid, ref);
      return this.performPatch(patch);
    };
    View.prototype.getHook = function (el) {
      return this.viewHooks[ViewHook.elementID(el)];
    };
    View.prototype.addHook = function (el) {
      if (ViewHook.elementID(el) || !el.getAttribute) {
        return;
      }
      var hookName = el.getAttribute(this.binding(constants_5.PHX_HOOK));
      if (hookName && !this.ownsElement(el)) {
        return;
      }
      var callbacks = this.liveSocket.getHookCallbacks(hookName);
      if (callbacks) {
        var hook = new ViewHook(this, el, callbacks);
        this.viewHooks[ViewHook.elementID(hook.el)] = hook;
        return hook;
      } else if (hookName !== null) {
        util_3.logError('unknown hook found for "' + hookName + '"', el);
      }
    };
    View.prototype.destroyHook = function (hook) {
      hook.__trigger__("destroyed");
      delete this.viewHooks[ViewHook.elementID(hook.el)];
    };
    View.prototype.applyPendingUpdates = function () {
      var _this = this;
      this.pendingDiffs.forEach(function (_a) {
        var diff = _a.diff,
          cid = _a.cid,
          ref = _a.ref;
        return _this.update(diff, cid, ref);
      });
      this.pendingDiffs = [];
    };
    View.prototype.onChannel = function (event, cb) {
      var _this = this;
      this.liveSocket.onChannel(this.channel, event, function (resp) {
        if (_this.isJoinPending()) {
          _this.root.pendingJoinOps.push([
            _this,
            function () {
              return cb(resp);
            },
          ]);
        } else {
          cb(resp);
        }
      });
    };
    View.prototype.bindChannel = function () {
      var _this = this;
      this.onChannel("diff", function (diff) {
        return _this.update(diff);
      });
      this.onChannel("redirect", function (_a) {
        var to = _a.to,
          flash = _a.flash;
        return _this.onRedirect({ to: to, flash: flash });
      });
      this.onChannel("live_patch", function (redir) {
        return _this.onLivePatch(redir);
      });
      this.onChannel("live_redirect", function (redir) {
        return _this.onLiveRedirect(redir);
      });
      this.onChannel("session", function (_a) {
        var token = _a.token;
        return _this.el.setAttribute(constants_5.PHX_SESSION, token);
      });
      this.channel.onError(function (reason) {
        return _this.onError(reason);
      });
      this.channel.onClose(function () {
        return _this.onError({ reason: "closed" });
      });
    };
    View.prototype.destroyAllChildren = function () {
      var _this = this;
      Object.keys(this.root.children[this.id]).forEach(function (id) {
        _this.getChildById(id).destroy();
      });
    };
    View.prototype.onLiveRedirect = function (redir) {
      var to = redir.to,
        kind = redir.kind,
        flash = redir.flash;
      var url = this.expandURL(to);
      this.liveSocket.historyRedirect(url, kind, flash);
    };
    View.prototype.onLivePatch = function (redir) {
      var to = redir.to,
        kind = redir.kind;
      this.href = this.expandURL(to);
      this.liveSocket.historyPatch(to, kind);
    };
    View.prototype.expandURL = function (to) {
      return to.startsWith("/")
        ? window.location.protocol + "//" + window.location.host + to
        : to;
    };
    View.prototype.onRedirect = function (_a) {
      var to = _a.to,
        flash = _a.flash;
      this.liveSocket.redirect(to, flash);
    };
    View.prototype.isDestroyed = function () {
      return this.destroyed;
    };
    View.prototype.join = function (callback) {
      var _this = this;
      if (!this.parent) {
        this.stopCallback = this.liveSocket.withPageLoading({
          to: this.href,
          kind: "initial",
        });
      }
      this.joinCallback = function () {
        return callback && callback(_this, _this.joinCount);
      };
      this.liveSocket.wrapPush(function () {
        return _this.channel
          .join()
          .receive("ok", function (data) {
            return _this.onJoin(data);
          })
          .receive("error", function (resp) {
            return _this.onJoinError(resp);
          })
          .receive("timeout", function () {
            return _this.onJoinError({ reason: "timeout" });
          });
      });
    };
    View.prototype.onJoinError = function (resp) {
      if (resp.redirect || resp.live_redirect) {
        this.channel.leave();
      }
      if (resp.redirect) {
        return this.onRedirect(resp.redirect);
      }
      if (resp.live_redirect) {
        return this.onLiveRedirect(resp.live_redirect);
      }
      this.log("error", function () {
        return ["unable to join", resp];
      });
      return this.liveSocket.reloadWithJitter(this);
    };
    View.prototype.onError = function (reason) {
      if (this.isJoinPending()) {
        return this.liveSocket.reloadWithJitter(this);
      }
      this.destroyAllChildren();
      this.log("error", function () {
        return ["view crashed", reason];
      });
      this.liveSocket.onViewError(this);
      document.activeElement.blur();
      if (this.liveSocket.isUnloaded()) {
        this.showLoader(constants_5.BEFORE_UNLOAD_LOADER_TIMEOUT);
      } else {
        this.displayError();
      }
    };
    View.prototype.displayError = function () {
      if (this.isMain()) {
        dom_1.DOM.dispatchEvent(window, "phx:page-loading-start", {
          to: this.href,
          kind: "error",
        });
      }
      this.showLoader();
      this.setContainerClasses(
        constants_5.PHX_DISCONNECTED_CLASS,
        constants_5.PHX_ERROR_CLASS
      );
    };
    View.prototype.pushWithReply = function (
      refGenerator,
      event,
      payload,
      onReply
    ) {
      var _this = this;
      if (onReply === void 0) {
        onReply = function (_resp) {};
      }
      var _a = __read(refGenerator ? refGenerator() : [null, []], 2),
        ref = _a[0],
        _b = __read(_a[1], 1),
        el = _b[0];
      var onLoadingDone = function () {};
      if (
        el &&
        el.getAttribute(this.binding(constants_5.PHX_PAGE_LOADING)) !== null
      ) {
        onLoadingDone = this.liveSocket.withPageLoading({
          kind: "element",
          target: el,
        });
      }
      if (typeof payload.cid !== "number") {
        delete payload.cid;
      }
      return this.liveSocket.wrapPush(function () {
        return _this.channel
          .push(event, payload, constants_5.PUSH_TIMEOUT)
          .receive("ok", function (resp) {
            if (resp.diff || ref !== null) {
              _this.update(resp.diff || {}, payload.cid, ref);
            }
            if (resp.redirect) {
              _this.onRedirect(resp.redirect);
            }
            if (resp.live_patch) {
              _this.onLivePatch(resp.live_patch);
            }
            if (resp.live_redirect) {
              _this.onLiveRedirect(resp.live_redirect);
            }
            onLoadingDone();
            onReply(resp);
          });
      });
    };
    View.prototype.putRef = function (elements, event) {
      var newRef = this.ref++;
      var disableWith = this.binding(constants_5.PHX_DISABLE_WITH);
      elements.forEach(function (el) {
        el.classList.add("phx-" + event + "-loading");
        el.setAttribute(constants_5.PHX_REF, String(newRef));
        var disableText = el.getAttribute(disableWith);
        if (disableText !== null) {
          if (!el.getAttribute(constants_5.PHX_DISABLE_WITH_RESTORE)) {
            el.setAttribute(constants_5.PHX_DISABLE_WITH_RESTORE, el.innerText);
          }
          el.innerText = disableText;
        }
      });
      return [newRef, elements];
    };
    View.prototype.componentID = function (el) {
      var cid = el.getAttribute && el.getAttribute(constants_5.PHX_COMPONENT);
      return cid ? parseInt(cid) : null;
    };
    View.prototype.targetComponentID = function (target, targetCtx) {
      if (target.getAttribute(this.binding("target"))) {
        return this.closestComponentID(targetCtx);
      } else {
        return null;
      }
    };
    View.prototype.closestComponentID = function (targetCtx) {
      var _this = this;
      if (targetCtx) {
        return util_3.maybe(
          targetCtx.closest("[" + constants_5.PHX_COMPONENT + "]"),
          function (el) {
            return _this.ownsElement(el) && _this.componentID(el);
          }
        );
      } else {
        return null;
      }
    };
    View.prototype.pushHookEvent = function (targetCtx, event, payload) {
      this.pushWithReply(null, "event", {
        type: "hook",
        event: event,
        value: payload,
        cid: this.closestComponentID(targetCtx),
      });
    };
    View.prototype.extractMeta = function (el, meta) {
      var prefix = this.binding("value-");
      for (var i = 0; i < el.attributes.length; i++) {
        var name_3 = el.attributes[i].name;
        if (name_3.startsWith(prefix)) {
          meta[name_3.replace(prefix, "")] = el.getAttribute(name_3);
        }
      }
      if (el.value !== undefined) {
        meta.value = el.value;
        if (
          el.tagName === "INPUT" &&
          constants_5.CHECKABLE_INPUTS.indexOf(el.type) >= 0 &&
          !el.checked
        ) {
          delete meta.value;
        }
      }
      return meta;
    };
    View.prototype.pushEvent = function (type, el, targetCtx, phxEvent, meta) {
      var _this = this;
      this.pushWithReply(
        function () {
          return _this.putRef([el], type);
        },
        "event",
        {
          type: type,
          event: phxEvent,
          value: this.extractMeta(el, meta),
          cid: this.targetComponentID(el, targetCtx),
        }
      );
    };
    View.prototype.pushKey = function (
      keyElement,
      targetCtx,
      kind,
      phxEvent,
      meta
    ) {
      var _this = this;
      this.pushWithReply(
        function () {
          return _this.putRef([keyElement], kind);
        },
        "event",
        {
          type: kind,
          event: phxEvent,
          value: this.extractMeta(keyElement, meta),
          cid: this.targetComponentID(keyElement, targetCtx),
        }
      );
    };
    View.prototype.pushInput = function (
      inputEl,
      targetCtx,
      phxEvent,
      eventTarget,
      callback
    ) {
      var _this = this;
      dom_1.DOM.dispatchEvent(inputEl.form, constants_5.PHX_CHANGE_EVENT, {
        triggeredBy: inputEl,
      });
      this.pushWithReply(
        function () {
          return _this.putRef([inputEl, inputEl.form], "change");
        },
        "event",
        {
          type: "form",
          event: phxEvent,
          value: util_3.serializeForm(inputEl.form, {
            _target: eventTarget.name,
          }),
          cid: this.targetComponentID(inputEl.form, targetCtx),
        },
        callback
      );
    };
    View.prototype.pushFormSubmit = function (
      formEl,
      targetCtx,
      phxEvent,
      onReply
    ) {
      var _this = this;
      var filterIgnored = function (el) {
        return !util_3.closestPhxBinding(
          el,
          _this.binding(constants_5.PHX_UPDATE) + "=ignore",
          el.form
        );
      };
      var refGenerator = function () {
        var disables = dom_1.DOM.all(
          formEl,
          "[" + _this.binding(constants_5.PHX_DISABLE_WITH) + "]"
        );
        var buttons = dom_1.DOM.all(formEl, "button").filter(filterIgnored);
        var inputs = dom_1.DOM.all(formEl, "input").filter(filterIgnored);
        buttons.forEach(function (button) {
          button.setAttribute(
            constants_5.PHX_DISABLED,
            button.disabled.toString()
          );
          button.disabled = true;
        });
        inputs.forEach(function (input) {
          input.setAttribute(
            constants_5.PHX_READONLY,
            input.readOnly.toString()
          );
          input.readOnly = true;
        });
        formEl.setAttribute(_this.binding(constants_5.PHX_PAGE_LOADING), "");
        return _this.putRef(
          [formEl].concat(disables).concat(buttons).concat(inputs),
          "submit"
        );
      };
      this.pushWithReply(
        refGenerator,
        "event",
        {
          type: "form",
          event: phxEvent,
          value: util_3.serializeForm(formEl),
          cid: this.targetComponentID(formEl, targetCtx),
        },
        onReply
      );
    };
    View.prototype.pushFormRecovery = function (form, callback) {
      var _this = this;
      this.liveSocket.withinOwners(form, function (view, targetCtx) {
        var input = form.elements[0];
        var phxEvent =
          form.getAttribute(_this.binding(constants_5.PHX_AUTO_RECOVER)) ||
          form.getAttribute(_this.binding("change"));
        view.pushInput(input, targetCtx, phxEvent, input, callback);
      });
    };
    View.prototype.pushLinkPatch = function (href, targetEl, callback) {
      var _this = this;
      if (!this.isLoading()) {
        this.showLoader(this.liveSocket.loaderTimeout);
      }
      var linkRef = this.liveSocket.setPendingLink(href);
      var refGen = targetEl
        ? function () {
            return _this.putRef([targetEl], "click");
          }
        : null;
      this.pushWithReply(refGen, "link", { url: href }, function (resp) {
        if (resp.link_redirect) {
          _this.liveSocket.replaceMain(href, null, callback, linkRef);
        } else if (_this.liveSocket.commitPendingLink(linkRef)) {
          _this.href = href;
          _this.applyPendingUpdates();
          _this.hideLoader();
          _this.triggerReconnected();
          callback && callback();
        }
      }).receive("timeout", function () {
        return _this.liveSocket.redirect(window.location.href);
      });
    };
    View.prototype.formsForRecovery = function (html) {
      var _this = this;
      var phxChange = this.binding("change");
      var template = document.createElement("template");
      template.innerHTML = html;
      return dom_1.DOM.all(this.el, "form[" + phxChange + "]")
        .filter(function (form) {
          return _this.ownsElement(form);
        })
        .filter(function (form) {
          return (
            form.getAttribute(_this.binding(constants_5.PHX_AUTO_RECOVER)) !==
            "ignore"
          );
        })
        .filter(function (form) {
          return template.content.querySelector(
            "form[" + phxChange + '="' + form.getAttribute(phxChange) + '"]'
          );
        });
    };
    View.prototype.maybePushComponentsDestroyed = function (destroyedCIDs) {
      var _this = this;
      var completelyDestroyedCIDs = destroyedCIDs.filter(function (cid) {
        return dom_1.DOM.findComponentNodeList(_this.el, cid).length === 0;
      });
      if (completelyDestroyedCIDs.length > 0) {
        this.pushWithReply(
          null,
          "cids_destroyed",
          { cids: completelyDestroyedCIDs },
          function () {
            _this.rendered.pruneCIDs(completelyDestroyedCIDs);
          }
        );
      }
    };
    View.prototype.ownsElement = function (el) {
      return (
        el.getAttribute(constants_5.PHX_PARENT_ID) === this.id ||
        util_3.maybe(el.closest(constants_5.PHX_VIEW_SELECTOR), function (
          node
        ) {
          return node.id;
        }) === this.id
      );
    };
    View.prototype.submitForm = function (form, targetCtx, phxEvent) {
      var _this = this;
      dom_1.DOM.putPrivate(form, constants_5.PHX_HAS_SUBMITTED, true);
      this.liveSocket.blurActiveElement(this);
      this.pushFormSubmit(form, targetCtx, phxEvent, function () {
        _this.liveSocket.restorePreviouslyActiveFocus();
      });
    };
    View.prototype.binding = function (kind) {
      return this.liveSocket.binding(kind);
    };
    return View;
  })();
  exports.View = View;
  var viewHookID = 1;
  var ViewHook = /** @class */ (function () {
    function ViewHook(view, el, callbacks) {
      var _this = this;
      this.__view = view;
      this.__liveSocket = view.liveSocket;
      this.__callbacks = callbacks;
      this.el = el;
      this.viewName = view.name();
      this.el.phxHookId = ViewHook.makeID();
      Object.keys(this.__callbacks).forEach(function (key) {
        _this[key] = _this.__callbacks[key];
      });
    }
    ViewHook.makeID = function () {
      return viewHookID++;
    };
    ViewHook.elementID = function (el) {
      return el.phxHookId;
    };
    ViewHook.prototype.pushEvent = function (event, payload) {
      if (payload === void 0) {
        payload = {};
      }
      this.__view.pushHookEvent(null, event, payload);
    };
    ViewHook.prototype.pushEventTo = function (phxTarget, event, payload) {
      if (payload === void 0) {
        payload = {};
      }
      this.__liveSocket.withinTargets(null, phxTarget, function (
        view,
        targetCtx
      ) {
        view.pushHookEvent(targetCtx, event, payload);
      });
    };
    ViewHook.prototype.__trigger__ = function (kind) {
      var callback = this.__callbacks[kind];
      callback && callback.call(this);
    };
    return ViewHook;
  })();
});
define("phoenix_live_view", [
  "require",
  "exports",
  "constants",
  "browser",
  "util",
  "dom",
  "view",
], function (require, exports, constants_6, browser_2, util_4, dom_2, view_1) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.debug = function (view, kind, msg, obj) {
    if (view.liveSocket.isDebugEnabled()) {
      console.log(view.id + " " + kind + ": " + msg + " - ", obj);
    }
  };
  /** Initializes the LiveSocket
   *
   *
   * @param {string} endPoint - The string WebSocket endpoint, ie, `"wss://example.com/live"`,
   *                                               `"/live"` (inherited host & protocol)
   * @param {Phoenix.Socket} socket - the required Phoenix Socket class imported from "phoenix". For example:
   *
   *     import {Socket} from "phoenix"
   *     import {LiveSocket} from "phoenix_live_view"
   *     let liveSocket = new LiveSocket("/live", Socket, {...})
   *
   * @param {Object} [opts] - Optional configuration. Outside of keys listed below, all
   * configuration is passed directly to the Phoenix Socket constructor.
   * @param {Function} [opts.defaults] - The optional defaults to use for various bindings,
   * such as `phx-debounce`. Supports the following keys:
   *
   *   - debounce - the millisecond phx-debounce time. Defaults 300
   *   - throttle - the millisecond phx-throttle time. Defaults 300
   *
   * @param {Function} [opts.params] - The optional function for passing connect params.
   * The function receives the viewName associated with a given LiveView. For example:
   *
   *     (viewName) => {view: viewName, token: window.myToken}
   *
   * @param {string} [opts.bindingPrefix] - The optional prefix to use for all phx DOM annotations.
   * Defaults to "phx-".
   * @param {string} [opts.hooks] - The optional object for referencing LiveView hook callbacks.
   * @param {integer} [opts.loaderTimeout] - The optional delay in milliseconds to wait before apply
   * loading states.
   * @param {Function} [opts.viewLogger] - The optional function to log debug information. For example:
   *
   *     (view, kind, msg, obj) => console.log(`${view.id} ${kind}: ${msg} - `, obj)
   */
  var LiveSocket = /** @class */ (function () {
    function LiveSocket(url, phxSocket, opts) {
      var _this = this;
      if (opts === void 0) {
        opts = {
          bindingPrefix: undefined,
          params: undefined,
          viewLogger: undefined,
          defaults: undefined,
          hooks: "",
          loaderTimeout: 0,
        };
      }
      this.unloaded = false;
      if (!phxSocket || phxSocket.constructor.name === "Object") {
        throw new Error(
          '\n      a phoenix Socket must be provided as the second argument to the LiveSocket constructor. For example:\n\n          import {Socket} from "phoenix"\n          import {LiveSocket} from "phoenix_live_view"\n          let liveSocket = new LiveSocket("/live", Socket, {...})\n      '
        );
      }
      this.socket = new phxSocket(url, opts);
      this.bindingPrefix = opts.bindingPrefix || constants_6.BINDING_PREFIX;
      this.opts = opts;
      this.params = util_4.closure(opts.params || {});
      this.viewLogger = opts.viewLogger;
      this.defaults = Object.assign(
        util_4.clone(constants_6.DEFAULTS),
        opts.defaults || {}
      );
      this.activeElement = null;
      this.prevActive = null;
      this.silenced = false;
      this.main = null;
      this.linkRef = 0;
      this.roots = {};
      this.href = window.location.href;
      this.pendingLink = null;
      this.currentLocation = util_4.clone(window.location);
      this.hooks = opts.hooks || {};
      this.loaderTimeout = opts.loaderTimeout || constants_6.LOADER_TIMEOUT;
      this.socket.onOpen(function () {
        if (_this.isUnloaded()) {
          _this.destroyAllViews();
          _this.joinRootViews();
        }
        _this.unloaded = false;
      });
      window.addEventListener("unload", function () {
        _this.unloaded = true;
      });
    }
    // public
    LiveSocket.prototype.isProfileEnabled = function () {
      return sessionStorage.getItem(constants_6.PHX_LV_PROFILE) === "true";
    };
    LiveSocket.prototype.isDebugEnabled = function () {
      return sessionStorage.getItem(constants_6.PHX_LV_DEBUG) === "true";
    };
    LiveSocket.prototype.enableDebug = function () {
      sessionStorage.setItem(constants_6.PHX_LV_DEBUG, "true");
    };
    LiveSocket.prototype.enableProfiling = function () {
      sessionStorage.setItem(constants_6.PHX_LV_PROFILE, "true");
    };
    LiveSocket.prototype.disableDebug = function () {
      sessionStorage.removeItem(constants_6.PHX_LV_DEBUG);
    };
    LiveSocket.prototype.disableProfiling = function () {
      sessionStorage.removeItem(constants_6.PHX_LV_PROFILE);
    };
    LiveSocket.prototype.enableLatencySim = function (upperBoundMs) {
      this.enableDebug();
      console.log(
        "latency simulator enabled for the duration of this browser session. Call disableLatencySim() to disable"
      );
      sessionStorage.setItem(constants_6.PHX_LV_LATENCY_SIM, upperBoundMs);
    };
    LiveSocket.prototype.disableLatencySim = function () {
      sessionStorage.removeItem(constants_6.PHX_LV_LATENCY_SIM);
    };
    LiveSocket.prototype.getLatencySim = function () {
      var str = sessionStorage.getItem(constants_6.PHX_LV_LATENCY_SIM);
      return str ? parseInt(str) : null;
    };
    LiveSocket.prototype.getSocket = function () {
      return this.socket;
    };
    LiveSocket.prototype.connect = function () {
      var _this = this;
      var doConnect = function () {
        if (_this.joinRootViews()) {
          _this.bindTopLevelEvents();
          _this.socket.connect();
        }
      };
      if (
        ["complete", "loaded", "interactive"].indexOf(document.readyState) >= 0
      ) {
        doConnect();
      } else {
        document.addEventListener("DOMContentLoaded", function () {
          return doConnect();
        });
      }
    };
    LiveSocket.prototype.disconnect = function () {
      this.socket.disconnect();
    };
    // private
    LiveSocket.prototype.time = function (name, func) {
      if (!this.isProfileEnabled() || !console.time) {
        return func();
      }
      console.time(name);
      var result = func();
      console.timeEnd(name);
      return result;
    };
    LiveSocket.prototype.log = function (view, kind, msgCallback) {
      if (this.viewLogger) {
        var _a = __read(msgCallback(), 2),
          msg = _a[0],
          obj = _a[1];
        this.viewLogger(view, kind, msg, obj);
      } else if (this.isDebugEnabled()) {
        var _b = __read(msgCallback(), 2),
          msg = _b[0],
          obj = _b[1];
        exports.debug(view, kind, msg, obj);
      }
    };
    LiveSocket.prototype.onChannel = function (channel, event, cb) {
      var _this = this;
      channel.on(event, function (data) {
        var latency = _this.getLatencySim();
        if (!latency) {
          cb(data);
        } else {
          console.log(
            "simulating " + latency + "ms of latency from server to client"
          );
          setTimeout(function () {
            return cb(data);
          }, latency);
        }
      });
    };
    LiveSocket.prototype.wrapPush = function (push) {
      var latency = this.getLatencySim();
      if (!latency) {
        return push();
      }
      console.log(
        "simulating " + latency + "ms of latency from client to server"
      );
      var fakePush = {
        receives: [],
        receive: function (kind, cb) {
          this.receives.push([kind, cb]);
        },
      };
      setTimeout(function () {
        fakePush.receives.reduce(function (acc, _a) {
          var _b = __read(_a, 2),
            kind = _b[0],
            cb = _b[1];
          return acc.receive(kind, cb);
        }, push());
      }, latency);
      return fakePush;
    };
    LiveSocket.prototype.reloadWithJitter = function (view) {
      var _this = this;
      this.disconnect();
      var _a = __read(constants_6.RELOAD_JITTER, 2),
        minMs = _a[0],
        maxMs = _a[1];
      var afterMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
      var tries = browser_2.Browser.updateLocal(
        view.name(),
        constants_6.CONSECUTIVE_RELOADS,
        0,
        function (count) {
          return count + 1;
        }
      );
      this.log(view, "join", function () {
        return ["encountered " + tries + " consecutive reloads"];
      });
      if (tries > constants_6.MAX_RELOADS) {
        this.log(view, "join", function () {
          return [
            "exceeded " +
              constants_6.MAX_RELOADS +
              " consecutive reloads. Entering failsafe mode",
          ];
        });
        afterMs = constants_6.FAILSAFE_JITTER;
      }
      setTimeout(function () {
        if (_this.hasPendingLink()) {
          window.location = _this.pendingLink;
        } else {
          window.location.reload();
        }
      }, afterMs);
    };
    LiveSocket.prototype.getHookCallbacks = function (hookName) {
      return this.hooks[hookName];
    };
    LiveSocket.prototype.isUnloaded = function () {
      return this.unloaded;
    };
    LiveSocket.prototype.isConnected = function () {
      return this.socket.isConnected();
    };
    LiveSocket.prototype.getBindingPrefix = function () {
      return this.bindingPrefix;
    };
    LiveSocket.prototype.binding = function (kind) {
      return "" + this.getBindingPrefix() + kind;
    };
    LiveSocket.prototype.channel = function (topic, params) {
      return this.socket.channel(topic, params);
    };
    LiveSocket.prototype.joinRootViews = function () {
      var _this = this;
      var rootsFound = false;
      dom_2.DOM.each(
        document,
        constants_6.PHX_VIEW_SELECTOR +
          ":not([" +
          constants_6.PHX_PARENT_ID +
          "])",
        function (rootEl) {
          var view = _this.joinRootView(rootEl, _this.getHref());
          _this.root = _this.root || view;
          if (rootEl.getAttribute(constants_6.PHX_MAIN)) {
            _this.main = view;
          }
          rootsFound = true;
        }
      );
      return rootsFound;
    };
    LiveSocket.prototype.redirect = function (to, flash) {
      this.disconnect();
      browser_2.Browser.redirect(to, flash);
    };
    LiveSocket.prototype.replaceMain = function (
      href,
      flash,
      callback,
      linkRef
    ) {
      var _this = this;
      if (callback === void 0) {
        callback = null;
      }
      if (linkRef === void 0) {
        linkRef = this.setPendingLink(href);
      }
      var mainEl = this.main.el;
      this.main.destroy();
      this.main.showLoader(this.loaderTimeout);
      browser_2.Browser.fetchPage(href, function (status, html) {
        if (status !== 200) {
          return _this.redirect(href);
        }
        var template = document.createElement("template");
        template.innerHTML = html;
        var el = template.content.childNodes[0];
        if (!el || !_this.isPhxView(el)) {
          return _this.redirect(href);
        }
        _this.joinRootView(el, href, flash, function (newMain, joinCount) {
          if (joinCount !== 1) {
            return;
          }
          if (!_this.commitPendingLink(linkRef)) {
            newMain.destroy();
            return;
          }
          mainEl.replaceWith(newMain.el);
          _this.main = newMain;
          callback && callback();
        });
      });
    };
    LiveSocket.prototype.isPhxView = function (el) {
      return el.getAttribute && el.getAttribute(constants_6.PHX_VIEW) !== null;
    };
    LiveSocket.prototype.joinRootView = function (el, href, flash, callback) {
      var view = new view_1.View(el, this, null, href, flash);
      this.roots[view.id] = view;
      view.join(callback);
      return view;
    };
    LiveSocket.prototype.owner = function (childEl, callback) {
      var _this = this;
      var view = util_4.maybe(
        childEl.closest(constants_6.PHX_VIEW_SELECTOR),
        function (el) {
          return _this.getViewByEl(el);
        }
      );
      if (view) {
        callback(view);
      }
    };
    LiveSocket.prototype.withinTargets = function (el, phxTarget, callback) {
      var _this = this;
      if (/^(0|[1-9](\d?)+)$/.test(phxTarget)) {
        var myselfTarget_1 = el;
        if (!myselfTarget_1) {
          throw new Error(
            "no phx-target's found matching @myself of " + phxTarget
          );
        }
        this.owner(myselfTarget_1, function (view) {
          return callback(view, myselfTarget_1);
        });
      } else {
        var targets = Array.from(document.querySelectorAll(phxTarget));
        if (targets.length === 0) {
          throw new Error(
            "no phx-target's found for selector \"" + phxTarget + '"'
          );
        }
        targets.forEach(function (targetEl) {
          _this.owner(targetEl, function (view) {
            return callback(view, targetEl);
          });
        });
      }
    };
    LiveSocket.prototype.withinOwners = function (childEl, callback) {
      var phxTarget = childEl.getAttribute(this.binding("target"));
      if (phxTarget === null) {
        this.owner(childEl, function (view) {
          return callback(view, childEl);
        });
      } else {
        this.withinTargets(childEl, phxTarget, callback);
      }
    };
    LiveSocket.prototype.getViewByEl = function (el) {
      var rootId = el.getAttribute(constants_6.PHX_ROOT_ID);
      return this.getRootById(rootId).getDescendentByEl(el);
    };
    LiveSocket.prototype.getRootById = function (id) {
      return this.roots[id];
    };
    LiveSocket.prototype.onViewError = function (view) {
      this.dropActiveElement(view);
    };
    LiveSocket.prototype.destroyAllViews = function () {
      for (var id in this.roots) {
        this.roots[id].destroy();
        delete this.roots[id];
      }
    };
    LiveSocket.prototype.destroyViewByEl = function (el) {
      var root = this.getRootById(el.getAttribute(constants_6.PHX_ROOT_ID));
      root.destroyDescendent(el.id);
    };
    LiveSocket.prototype.setActiveElement = function (target) {
      var _this = this;
      if (this.activeElement === target) {
        return;
      }
      this.activeElement = target;
      var cancel = function () {
        if (target === _this.activeElement) {
          _this.activeElement = null;
        }
        target.removeEventListener("mouseup", _this);
        target.removeEventListener("touchend", _this);
      };
      target.addEventListener("mouseup", cancel);
      target.addEventListener("touchend", cancel);
    };
    LiveSocket.prototype.getActiveElement = function () {
      if (document.activeElement === document.body) {
        return this.activeElement || document.activeElement;
      } else {
        return document.activeElement;
      }
    };
    LiveSocket.prototype.dropActiveElement = function (view) {
      if (this.prevActive && view.ownsElement(this.prevActive)) {
        this.prevActive = null;
      }
    };
    LiveSocket.prototype.restorePreviouslyActiveFocus = function () {
      var _a;
      if (this.prevActive !== document.body) {
        (_a = this.prevActive) === null || _a === void 0 ? void 0 : _a.focus();
      }
    };
    LiveSocket.prototype.blurActiveElement = function () {
      this.prevActive = this.getActiveElement();
      if (this.prevActive !== document.body) {
        this.prevActive.blur();
      }
    };
    LiveSocket.prototype.bindTopLevelEvents = function () {
      var _this = this;
      this.bindClicks();
      this.bindNav();
      this.bindForms();
      this.bind({ keyup: "keyup", keydown: "keydown" }, function (
        e,
        type,
        view,
        target,
        targetCtx,
        phxEvent,
        _phxTarget
      ) {
        var matchKey = target.getAttribute(_this.binding(constants_6.PHX_KEY));
        if (matchKey && matchKey.toLowerCase() !== e.key.toLowerCase()) {
          return;
        }
        view.pushKey(target, targetCtx, type, phxEvent, {
          altGraphKey: e.altGraphKey,
          altKey: e.altKey,
          code: e.code,
          ctrlKey: e.ctrlKey,
          key: e.key,
          keyIdentifier: e.keyIdentifier,
          keyLocation: e.keyLocation,
          location: e.location,
          metaKey: e.metaKey,
          repeat: e.repeat,
          shiftKey: e.shiftKey,
        });
      });
      this.bind({ blur: "focusout", focus: "focusin" }, function (
        e,
        type,
        view,
        targetEl,
        targetCtx,
        phxEvent,
        phxTarget
      ) {
        if (!phxTarget) {
          view.pushEvent(type, targetEl, targetCtx, phxEvent, { type: type });
        }
      });
      this.bind({ blur: "blur", focus: "focus" }, function (
        e,
        type,
        view,
        targetEl,
        targetCtx,
        phxEvent,
        phxTarget
      ) {
        // blur and focus are triggered on document and window. Discard one to avoid dups
        if (
          phxTarget !== null && phxTarget !== void 0
            ? phxTarget
            : phxTarget !== "window"
        ) {
          view.pushEvent(type, targetEl, targetCtx, phxEvent, { type: e.type });
        }
      });
    };
    LiveSocket.prototype.setPendingLink = function (href) {
      this.linkRef++;
      this.pendingLink = href;
      return this.linkRef;
    };
    LiveSocket.prototype.commitPendingLink = function (linkRef) {
      if (this.linkRef !== linkRef) {
        return false;
      } else {
        this.href = this.pendingLink;
        this.pendingLink = null;
        return true;
      }
    };
    LiveSocket.prototype.getHref = function () {
      return this.href;
    };
    LiveSocket.prototype.hasPendingLink = function () {
      return !!this.pendingLink;
    };
    LiveSocket.prototype.bind = function (events, callback) {
      var _this = this;
      Object.keys(events).forEach(function (event) {
        var browserEventName = events[event];
        _this.on(browserEventName, function (e) {
          var binding = _this.binding(event);
          var windowBinding = _this.binding("window-" + event);
          var targetPhxEvent =
            e.target.getAttribute && e.target.getAttribute(binding);
          if (targetPhxEvent) {
            _this.debounce(e.target, e, function () {
              _this.withinOwners(e.target, function (view, targetCtx) {
                callback(
                  e,
                  event,
                  view,
                  e.target,
                  targetCtx,
                  targetPhxEvent,
                  null
                );
              });
            });
          } else {
            dom_2.DOM.each(document, "[" + windowBinding + "]", function (el) {
              var phxEvent = el.getAttribute(windowBinding);
              _this.debounce(el, e, function () {
                _this.withinOwners(el, function (view, targetCtx) {
                  callback(e, event, view, el, targetCtx, phxEvent, "window");
                });
              });
            });
          }
        });
      });
    };
    LiveSocket.prototype.bindClicks = function () {
      var _this = this;
      [true, false].forEach(function (capture) {
        var click = capture
          ? _this.binding("capture-click")
          : _this.binding("click");
        window.addEventListener(
          "click",
          function (e) {
            var target = null;
            if (capture) {
              target = e.target.matches("[" + click + "]")
                ? e.target
                : e.target.querySelector("[" + click + "]");
            } else {
              target = util_4.closestPhxBinding(e.target, click);
            }
            var phxEvent = target && target.getAttribute(click);
            if (!phxEvent) {
              return;
            }
            if (target.getAttribute("href") === "#") {
              e.preventDefault();
            }
            var meta = {
              altKey: e.altKey,
              shiftKey: e.shiftKey,
              ctrlKey: e.ctrlKey,
              metaKey: e.metaKey,
              x: e.x || e.clientX,
              y: e.y || e.clientY,
              pageX: e.pageX,
              pageY: e.pageY,
              screenX: e.screenX,
              screenY: e.screenY,
              offsetX: e.offsetX,
              offsetY: e.offsetY,
              detail: e.detail || 1,
            };
            _this.debounce(target, e, function () {
              _this.withinOwners(target, function (view, targetCtx) {
                view.pushEvent("click", target, targetCtx, phxEvent, meta);
              });
            });
          },
          capture
        );
      });
    };
    LiveSocket.prototype.bindNav = function () {
      var _this = this;
      if (!browser_2.Browser.canPushState()) {
        return;
      }
      window.onpopstate = function (event) {
        if (!_this.registerNewLocation(window.location)) {
          return;
        }
        var _a = event.state || {},
          type = _a.type,
          id = _a.id,
          root = _a.root;
        var href = window.location.href;
        if (
          _this.main.isConnected() &&
          type === "patch" &&
          id === _this.main.id
        ) {
          _this.main.pushLinkPatch(href, null);
        } else {
          _this.replaceMain(href, null, function () {
            if (root) {
              _this.replaceRootHistory();
            }
          });
        }
      };
      window.addEventListener(
        "click",
        function (e) {
          var target = util_4.closestPhxBinding(
            e.target,
            constants_6.PHX_LIVE_LINK
          );
          var type = target && target.getAttribute(constants_6.PHX_LIVE_LINK);
          var wantsNewTab = e.metaKey || e.ctrlKey || e.button === 1;
          if (!type || !_this.isConnected() || !_this.main || wantsNewTab) {
            return;
          }
          var href = target.href;
          var linkState = target.getAttribute(constants_6.PHX_LINK_STATE);
          e.preventDefault();
          if (_this.pendingLink === href) {
            return;
          }
          if (type === "patch") {
            _this.pushHistoryPatch(href, linkState, target);
          } else if (type === "redirect") {
            _this.historyRedirect(href, linkState);
          } else {
            throw new Error(
              "expected " +
                constants_6.PHX_LIVE_LINK +
                ' to be "patch" or "redirect", got: ' +
                type
            );
          }
        },
        false
      );
    };
    LiveSocket.prototype.withPageLoading = function (info, callback) {
      dom_2.DOM.dispatchEvent(window, "phx:page-loading-start", info);
      var done = function () {
        return dom_2.DOM.dispatchEvent(window, "phx:page-loading-stop", info);
      };
      return callback ? callback(done) : done;
    };
    LiveSocket.prototype.pushHistoryPatch = function (
      href,
      linkState,
      targetEl
    ) {
      var _this = this;
      this.withPageLoading({ to: href, kind: "patch" }, function (done) {
        _this.main.pushLinkPatch(href, targetEl, function () {
          _this.historyPatch(href, linkState);
          done();
        });
      });
    };
    LiveSocket.prototype.historyPatch = function (href, linkState) {
      browser_2.Browser.pushState(
        linkState,
        { type: "patch", id: this.main.id },
        href
      );
      this.registerNewLocation(window.location);
    };
    LiveSocket.prototype.historyRedirect = function (href, linkState, flash) {
      var _this = this;
      this.withPageLoading({ to: href, kind: "redirect" }, function (done) {
        _this.replaceMain(href, flash, function () {
          browser_2.Browser.pushState(
            linkState,
            { type: "redirect", id: _this.main.id },
            href
          );
          _this.registerNewLocation(window.location);
          done();
        });
      });
    };
    LiveSocket.prototype.replaceRootHistory = function () {
      browser_2.Browser.pushState("replace", {
        root: true,
        type: "patch",
        id: this.main.id,
      });
    };
    LiveSocket.prototype.registerNewLocation = function (newLocation) {
      var _a = this.currentLocation,
        pathname = _a.pathname,
        search = _a.search;
      if (pathname + search === newLocation.pathname + newLocation.search) {
        return false;
      } else {
        this.currentLocation = util_4.clone(newLocation);
        return true;
      }
    };
    LiveSocket.prototype.bindForms = function () {
      var e_2, _a;
      var _this = this;
      var iterations = 0;
      this.on("submit", function (e) {
        var phxEvent = e.target.getAttribute(_this.binding("submit"));
        if (!phxEvent) {
          return;
        }
        e.preventDefault();
        e.target.disabled = true;
        _this.withinOwners(e.target, function (view, targetCtx) {
          return view.submitForm(e.target, targetCtx, phxEvent);
        });
      });
      var _loop_1 = function (type) {
        this_1.on(type, function (e) {
          var input = e.target;
          var phxEvent =
            input.form && input.form.getAttribute(_this.binding("change"));
          if (!phxEvent) {
            return;
          }
          if (
            input.type === "number" &&
            input.validity &&
            input.validity.badInput
          ) {
            return;
          }
          var currentIterations = iterations;
          iterations++;
          var _a = dom_2.DOM.private(input, "prev-iteration") || {},
            at = _a.at,
            lastType = _a.type;
          // detect dup because some browsers dispatch both "input" and "change"
          if (at === currentIterations - 1 && type !== lastType) {
            return;
          }
          dom_2.DOM.putPrivate(input, "prev-iteration", {
            at: currentIterations,
            type: type,
          });
          _this.debounce(input, e, function () {
            _this.withinOwners(input.form, function (view, targetCtx) {
              if (dom_2.DOM.isTextualInput(input)) {
                dom_2.DOM.putPrivate(input, constants_6.PHX_HAS_FOCUSED, true);
              } else {
                _this.setActiveElement(input);
              }
              view.pushInput(input, targetCtx, phxEvent, e.target);
            });
          });
        });
      };
      var this_1 = this;
      try {
        for (
          var _b = __values(["change", "input"]), _c = _b.next();
          !_c.done;
          _c = _b.next()
        ) {
          var type = _c.value;
          _loop_1(type);
        }
      } catch (e_2_1) {
        e_2 = { error: e_2_1 };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_2) throw e_2.error;
        }
      }
    };
    LiveSocket.prototype.debounce = function (el, event, callback) {
      var phxDebounce = this.binding(constants_6.PHX_DEBOUNCE);
      var phxThrottle = this.binding(constants_6.PHX_THROTTLE);
      var defaultDebounce = this.defaults.debounce.toString();
      var defaultThrottle = this.defaults.throttle.toString();
      dom_2.DOM.debounce(
        el,
        event,
        phxDebounce,
        defaultDebounce,
        phxThrottle,
        defaultThrottle,
        callback
      );
    };
    LiveSocket.prototype.silenceEvents = function (callback) {
      this.silenced = true;
      callback();
      this.silenced = false;
    };
    LiveSocket.prototype.on = function (event, callback) {
      var _this = this;
      window.addEventListener(event, function (e) {
        if (!_this.silenced) {
          callback(e);
        }
      });
    };
    return LiveSocket;
  })();
  exports.LiveSocket = LiveSocket;
  exports.default = LiveSocket;
});
