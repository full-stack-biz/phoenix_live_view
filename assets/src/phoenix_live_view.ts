/*
================================================================================
Phoenix LiveView JavaScript Client
================================================================================

See the hexdocs at `https://hexdocs.pm/phoenix_live_view` for documentation.

*/
import { Socket } from "phoenix";
import {
  DEFAULTS,
  PHX_VIEW_SELECTOR,
  LOADER_TIMEOUT,
  PHX_LV_PROFILE,
  PHX_LV_DEBUG,
  PHX_LV_LATENCY_SIM,
  BINDING_PREFIX,
  RELOAD_JITTER,
  CONSECUTIVE_RELOADS,
  MAX_RELOADS,
  FAILSAFE_JITTER,
  PHX_PARENT_ID,
  PHX_MAIN,
  PHX_VIEW,
  PHX_ROOT_ID,
  PHX_KEY,
  PHX_LIVE_LINK,
  PHX_LINK_STATE,
  PHX_HAS_FOCUSED,
  PHX_DEBOUNCE,
  PHX_THROTTLE,
} from "./constants";
import { Browser } from "./browser";
import { clone, closestPhxBinding, closure, maybe } from "./util";
import { DOM } from "./dom";
import { View } from "./view";

export const debug = (view, kind, msg, obj) => {
  if (view.liveSocket.isDebugEnabled()) {
    console.log(`${view.id} ${kind}: ${msg} - `, obj);
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
export class LiveSocket {
  private unloaded: boolean;
  private readonly socket: Socket;
  private readonly bindingPrefix: string;
  private opts: {};
  private params: any;
  private readonly viewLogger: any;
  private defaults: any;
  private activeElement: null;
  private prevActive: HTMLElement;
  private silenced: boolean;
  private main: View;
  private linkRef: number;
  private readonly roots: {};
  private href: string;
  private pendingLink: null;
  private currentLocation: any;
  private readonly hooks: {};
  private readonly loaderTimeout: any;
  private root: any;

  constructor(
    url,
    phxSocket,
    opts = {
      bindingPrefix: undefined,
      params: undefined,
      viewLogger: undefined,
      defaults: undefined,
      hooks: "",
      loaderTimeout: 0,
    }
  ) {
    this.unloaded = false;
    if (!phxSocket || phxSocket.constructor.name === "Object") {
      throw new Error(`
      a phoenix Socket must be provided as the second argument to the LiveSocket constructor. For example:

          import {Socket} from "phoenix"
          import {LiveSocket} from "phoenix_live_view"
          let liveSocket = new LiveSocket("/live", Socket, {...})
      `);
    }
    this.socket = new phxSocket(url, opts);
    this.bindingPrefix = opts.bindingPrefix || BINDING_PREFIX;
    this.opts = opts;
    this.params = closure(opts.params || {});
    this.viewLogger = opts.viewLogger;
    this.defaults = Object.assign(clone(DEFAULTS), opts.defaults || {});
    this.activeElement = null;
    this.prevActive = null;
    this.silenced = false;
    this.main = null;
    this.linkRef = 0;
    this.roots = {};
    this.href = window.location.href;
    this.pendingLink = null;
    this.currentLocation = clone(window.location);
    this.hooks = opts.hooks || {};
    this.loaderTimeout = opts.loaderTimeout || LOADER_TIMEOUT;

    this.socket.onOpen(() => {
      if (this.isUnloaded()) {
        this.destroyAllViews();
        this.joinRootViews();
      }
      this.unloaded = false;
    });
    window.addEventListener("unload", () => {
      this.unloaded = true;
    });
  }

  // public

  isProfileEnabled() {
    return sessionStorage.getItem(PHX_LV_PROFILE) === "true";
  }

  isDebugEnabled() {
    return sessionStorage.getItem(PHX_LV_DEBUG) === "true";
  }

  enableDebug() {
    sessionStorage.setItem(PHX_LV_DEBUG, "true");
  }

  enableProfiling() {
    sessionStorage.setItem(PHX_LV_PROFILE, "true");
  }

  disableDebug() {
    sessionStorage.removeItem(PHX_LV_DEBUG);
  }

  disableProfiling() {
    sessionStorage.removeItem(PHX_LV_PROFILE);
  }

  enableLatencySim(upperBoundMs) {
    this.enableDebug();
    console.log(
      "latency simulator enabled for the duration of this browser session. Call disableLatencySim() to disable"
    );
    sessionStorage.setItem(PHX_LV_LATENCY_SIM, upperBoundMs);
  }

  disableLatencySim() {
    sessionStorage.removeItem(PHX_LV_LATENCY_SIM);
  }

  getLatencySim() {
    const str = sessionStorage.getItem(PHX_LV_LATENCY_SIM);
    return str ? parseInt(str) : null;
  }

  getSocket() {
    return this.socket;
  }

  connect() {
    const doConnect = () => {
      if (this.joinRootViews()) {
        this.bindTopLevelEvents();
        this.socket.connect();
      }
    };
    if (
      ["complete", "loaded", "interactive"].indexOf(document.readyState) >= 0
    ) {
      doConnect();
    } else {
      document.addEventListener("DOMContentLoaded", () => doConnect());
    }
  }

  disconnect() {
    this.socket.disconnect();
  }

  // private

  time(name, func) {
    if (!this.isProfileEnabled() || !console.time) {
      return func();
    }
    console.time(name);
    const result = func();
    console.timeEnd(name);
    return result;
  }

  log(view, kind, msgCallback) {
    if (this.viewLogger) {
      const [msg, obj] = msgCallback();
      this.viewLogger(view, kind, msg, obj);
    } else if (this.isDebugEnabled()) {
      const [msg, obj] = msgCallback();
      debug(view, kind, msg, obj);
    }
  }

  onChannel(channel, event, cb) {
    channel.on(event, (data) => {
      const latency = this.getLatencySim();
      if (!latency) {
        cb(data);
      } else {
        console.log(`simulating ${latency}ms of latency from server to client`);
        setTimeout(() => cb(data), latency);
      }
    });
  }

  wrapPush(push) {
    const latency = this.getLatencySim();
    if (!latency) {
      return push();
    }

    console.log(`simulating ${latency}ms of latency from client to server`);
    const fakePush = {
      receives: [],
      receive(kind, cb) {
        this.receives.push([kind, cb]);
      },
    };
    setTimeout(() => {
      fakePush.receives.reduce(
        (acc, [kind, cb]) => acc.receive(kind, cb),
        push()
      );
    }, latency);
    return fakePush;
  }

  reloadWithJitter(view) {
    this.disconnect();
    const [minMs, maxMs] = RELOAD_JITTER;
    let afterMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    const tries = Browser.updateLocal(
      view.name(),
      CONSECUTIVE_RELOADS,
      0,
      (count) => count + 1
    );
    this.log(view, "join", () => [`encountered ${tries} consecutive reloads`]);
    if (tries > MAX_RELOADS) {
      this.log(view, "join", () => [
        `exceeded ${MAX_RELOADS} consecutive reloads. Entering failsafe mode`,
      ]);
      afterMs = FAILSAFE_JITTER;
    }
    setTimeout(() => {
      if (this.hasPendingLink()) {
        window.location = this.pendingLink;
      } else {
        window.location.reload();
      }
    }, afterMs);
  }

  getHookCallbacks(hookName) {
    return this.hooks[hookName];
  }

  isUnloaded() {
    return this.unloaded;
  }

  isConnected() {
    return this.socket.isConnected();
  }

  getBindingPrefix() {
    return this.bindingPrefix;
  }

  binding(kind) {
    return `${this.getBindingPrefix()}${kind}`;
  }

  channel(topic, params) {
    return this.socket.channel(topic, params);
  }

  joinRootViews() {
    let rootsFound = false;
    DOM.each(
      document,
      `${PHX_VIEW_SELECTOR}:not([${PHX_PARENT_ID}])`,
      (rootEl) => {
        const view = this.joinRootView(rootEl, this.getHref());
        this.root = this.root || view;
        if (rootEl.getAttribute(PHX_MAIN)) {
          this.main = view;
        }
        rootsFound = true;
      }
    );
    return rootsFound;
  }

  redirect(to, flash?) {
    this.disconnect();
    Browser.redirect(to, flash);
  }

  replaceMain(
    href,
    flash,
    callback = null,
    linkRef = this.setPendingLink(href)
  ) {
    const mainEl = this.main.el;
    this.main.destroy();
    this.main.showLoader(this.loaderTimeout);

    Browser.fetchPage(href, (status, html) => {
      if (status !== 200) {
        return this.redirect(href);
      }

      const template = document.createElement("template");
      template.innerHTML = html;
      const el = template.content.childNodes[0];
      if (!el || !this.isPhxView(el)) {
        return this.redirect(href);
      }

      this.joinRootView(el, href, flash, (newMain, joinCount) => {
        if (joinCount !== 1) {
          return;
        }
        if (!this.commitPendingLink(linkRef)) {
          newMain.destroy();
          return;
        }
        mainEl.replaceWith(newMain.el);
        this.main = newMain;
        callback && callback();
      });
    });
  }

  isPhxView(el) {
    return el.getAttribute && el.getAttribute(PHX_VIEW) !== null;
  }

  joinRootView(el, href, flash?, callback?) {
    const view = new View(el, this, null, href, flash);
    this.roots[view.id] = view;
    view.join(callback);
    return view;
  }

  owner(childEl, callback) {
    const view = maybe(childEl.closest(PHX_VIEW_SELECTOR), (el) =>
      this.getViewByEl(el)
    );
    if (view) {
      callback(view);
    }
  }

  withinTargets(el, phxTarget, callback) {
    if (/^(0|[1-9](\d?)+)$/.test(phxTarget)) {
      const myselfTarget = el;
      if (!myselfTarget) {
        throw new Error(
          `no phx-target's found matching @myself of ${phxTarget}`
        );
      }
      this.owner(myselfTarget, (view) => callback(view, myselfTarget));
    } else {
      const targets = Array.from(document.querySelectorAll(phxTarget));
      if (targets.length === 0) {
        throw new Error(`no phx-target's found for selector "${phxTarget}"`);
      }
      targets.forEach((targetEl) => {
        this.owner(targetEl, (view) => callback(view, targetEl));
      });
    }
  }

  withinOwners(childEl, callback) {
    const phxTarget = childEl.getAttribute(this.binding("target"));
    if (phxTarget === null) {
      this.owner(childEl, (view) => callback(view, childEl));
    } else {
      this.withinTargets(childEl, phxTarget, callback);
    }
  }

  getViewByEl(el) {
    const rootId = el.getAttribute(PHX_ROOT_ID);
    return this.getRootById(rootId).getDescendentByEl(el);
  }

  getRootById(id) {
    return this.roots[id];
  }

  onViewError(view) {
    this.dropActiveElement(view);
  }

  destroyAllViews() {
    for (const id in this.roots) {
      this.roots[id].destroy();
      delete this.roots[id];
    }
  }

  destroyViewByEl(el) {
    const root = this.getRootById(el.getAttribute(PHX_ROOT_ID));
    root.destroyDescendent(el.id);
  }

  setActiveElement(target) {
    if (this.activeElement === target) {
      return;
    }
    this.activeElement = target;
    const cancel = () => {
      if (target === this.activeElement) {
        this.activeElement = null;
      }
      target.removeEventListener("mouseup", this);
      target.removeEventListener("touchend", this);
    };
    target.addEventListener("mouseup", cancel);
    target.addEventListener("touchend", cancel);
  }

  getActiveElement() {
    if (document.activeElement === document.body) {
      return this.activeElement || document.activeElement;
    } else {
      return document.activeElement;
    }
  }

  dropActiveElement(view) {
    if (this.prevActive && view.ownsElement(this.prevActive)) {
      this.prevActive = null;
    }
  }

  restorePreviouslyActiveFocus() {
    if (this.prevActive !== document.body) {
      this.prevActive?.focus();
    }
  }

  blurActiveElement() {
    this.prevActive = this.getActiveElement() as HTMLElement;
    if (this.prevActive !== document.body) {
      this.prevActive.blur();
    }
  }

  bindTopLevelEvents() {
    this.bindClicks();
    this.bindNav();
    this.bindForms();
    this.bind(
      { keyup: "keyup", keydown: "keydown" },
      (e, type, view, target, targetCtx, phxEvent, _phxTarget) => {
        const matchKey = target.getAttribute(this.binding(PHX_KEY));
        if (matchKey && matchKey.toLowerCase() !== e.key?.toLowerCase()) {
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
      }
    );
    this.bind(
      { blur: "focusout", focus: "focusin" },
      (e, type, view, targetEl, targetCtx, phxEvent, phxTarget) => {
        if (!phxTarget) {
          view.pushEvent(type, targetEl, targetCtx, phxEvent, { type: type });
        }
      }
    );
    this.bind(
      { blur: "blur", focus: "focus" },
      (e, type, view, targetEl, targetCtx, phxEvent, phxTarget?: string) => {
        // blur and focus are triggered on document and window. Discard one to avoid dups
        if (phxTarget ?? phxTarget !== "window") {
          view.pushEvent(type, targetEl, targetCtx, phxEvent, { type: e.type });
        }
      }
    );
  }

  setPendingLink(href) {
    this.linkRef++;
    this.pendingLink = href;
    return this.linkRef;
  }

  commitPendingLink(linkRef) {
    if (this.linkRef !== linkRef) {
      return false;
    } else {
      this.href = this.pendingLink;
      this.pendingLink = null;
      return true;
    }
  }

  getHref() {
    return this.href;
  }

  hasPendingLink() {
    return !!this.pendingLink;
  }

  bind(events, callback) {
    Object.keys(events).forEach((event) => {
      const browserEventName = events[event];

      this.on(browserEventName, (e) => {
        const binding = this.binding(event);
        const windowBinding = this.binding(`window-${event}`);
        const targetPhxEvent =
          e.target.getAttribute && e.target.getAttribute(binding);
        if (targetPhxEvent) {
          this.debounce(e.target, e, () => {
            this.withinOwners(e.target, (view, targetCtx) => {
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
          DOM.each(document, `[${windowBinding}]`, (el) => {
            const phxEvent = el.getAttribute(windowBinding);
            this.debounce(el, e, () => {
              this.withinOwners(el, (view, targetCtx) => {
                callback(e, event, view, el, targetCtx, phxEvent, "window");
              });
            });
          });
        }
      });
    });
  }

  bindClicks() {
    [true, false].forEach((capture) => {
      const click = capture
        ? this.binding("capture-click")
        : this.binding("click");
      window.addEventListener(
        "click",
        (e) => {
          let target = null;
          if (capture) {
            target = (e.target as HTMLElement).matches(`[${click}]`)
              ? e.target
              : (e.target as HTMLElement).querySelector(`[${click}]`);
          } else {
            target = closestPhxBinding(e.target, click);
          }
          const phxEvent = target && target.getAttribute(click);
          if (!phxEvent) {
            return;
          }
          if (target.getAttribute("href") === "#") {
            e.preventDefault();
          }

          const meta = {
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

          this.debounce(target, e, () => {
            this.withinOwners(target, (view, targetCtx) => {
              view.pushEvent("click", target, targetCtx, phxEvent, meta);
            });
          });
        },
        capture
      );
    });
  }

  bindNav() {
    if (!Browser.canPushState()) {
      return;
    }
    window.onpopstate = (event) => {
      if (!this.registerNewLocation(window.location)) {
        return;
      }
      const { type, id, root } = event.state || {};
      const href = window.location.href;

      if (this.main.isConnected() && type === "patch" && id === this.main.id) {
        this.main.pushLinkPatch(href, null);
      } else {
        this.replaceMain(href, null, () => {
          if (root) {
            this.replaceRootHistory();
          }
        });
      }
    };
    window.addEventListener(
      "click",
      (e) => {
        const target = closestPhxBinding(e.target, PHX_LIVE_LINK);
        const type = target && target.getAttribute(PHX_LIVE_LINK);
        const wantsNewTab = e.metaKey || e.ctrlKey || e.button === 1;
        if (!type || !this.isConnected() || !this.main || wantsNewTab) {
          return;
        }
        const href = target.href;
        const linkState = target.getAttribute(PHX_LINK_STATE);
        e.preventDefault();
        if (this.pendingLink === href) {
          return;
        }

        if (type === "patch") {
          this.pushHistoryPatch(href, linkState, target);
        } else if (type === "redirect") {
          this.historyRedirect(href, linkState);
        } else {
          throw new Error(
            `expected ${PHX_LIVE_LINK} to be "patch" or "redirect", got: ${type}`
          );
        }
      },
      false
    );
  }

  withPageLoading(info, callback) {
    DOM.dispatchEvent(window, "phx:page-loading-start", info);
    const done = () => DOM.dispatchEvent(window, "phx:page-loading-stop", info);
    return callback ? callback(done) : done;
  }

  pushHistoryPatch(href, linkState, targetEl) {
    this.withPageLoading({ to: href, kind: "patch" }, (done) => {
      this.main.pushLinkPatch(href, targetEl, () => {
        this.historyPatch(href, linkState);
        done();
      });
    });
  }

  historyPatch(href, linkState) {
    Browser.pushState(linkState, { type: "patch", id: this.main.id }, href);
    this.registerNewLocation(window.location);
  }

  historyRedirect(href, linkState, flash?) {
    this.withPageLoading({ to: href, kind: "redirect" }, (done) => {
      this.replaceMain(href, flash, () => {
        Browser.pushState(
          linkState,
          { type: "redirect", id: this.main.id },
          href
        );
        this.registerNewLocation(window.location);
        done();
      });
    });
  }

  replaceRootHistory() {
    Browser.pushState("replace", {
      root: true,
      type: "patch",
      id: this.main.id,
    });
  }

  registerNewLocation(newLocation) {
    const { pathname, search } = this.currentLocation;
    if (pathname + search === newLocation.pathname + newLocation.search) {
      return false;
    } else {
      this.currentLocation = clone(newLocation);
      return true;
    }
  }

  bindForms() {
    let iterations = 0;
    this.on("submit", (e) => {
      const phxEvent = e.target.getAttribute(this.binding("submit"));
      if (!phxEvent) {
        return;
      }
      e.preventDefault();
      e.target.disabled = true;
      this.withinOwners(e.target, (view, targetCtx) =>
        view.submitForm(e.target, targetCtx, phxEvent)
      );
    });

    for (const type of ["change", "input"]) {
      this.on(type, (e) => {
        const input = e.target;
        const phxEvent =
          input.form && input.form.getAttribute(this.binding("change"));
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
        const currentIterations = iterations;
        iterations++;
        const { at: at, type: lastType } =
          DOM.private(input, "prev-iteration") || {};
        // detect dup because some browsers dispatch both "input" and "change"
        if (at === currentIterations - 1 && type !== lastType) {
          return;
        }

        DOM.putPrivate(input, "prev-iteration", {
          at: currentIterations,
          type: type,
        });

        this.debounce(input, e, () => {
          this.withinOwners(input.form, (view, targetCtx) => {
            if (DOM.isTextualInput(input)) {
              DOM.putPrivate(input, PHX_HAS_FOCUSED, true);
            } else {
              this.setActiveElement(input);
            }
            view.pushInput(input, targetCtx, phxEvent, e.target);
          });
        });
      });
    }
  }

  debounce(el, event, callback) {
    const phxDebounce = this.binding(PHX_DEBOUNCE);
    const phxThrottle = this.binding(PHX_THROTTLE);
    const defaultDebounce = this.defaults.debounce.toString();
    const defaultThrottle = this.defaults.throttle.toString();
    DOM.debounce(
      el,
      event,
      phxDebounce,
      defaultDebounce,
      phxThrottle,
      defaultThrottle,
      callback
    );
  }

  silenceEvents(callback) {
    this.silenced = true;
    callback();
    this.silenced = false;
  }

  on(event, callback) {
    window.addEventListener(event, (e) => {
      if (!this.silenced) {
        callback(e);
      }
    });
  }
}

export default LiveSocket;
