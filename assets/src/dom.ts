import {
  DEBOUNCE_BLUR,
  DEBOUNCE_BLUR_TIMER,
  DEBOUNCE_PREV_KEY,
  DEBOUNCE_TIMER,
  PHX_CHANGE_EVENT,
  PHX_COMPONENT,
  PHX_HAS_FOCUSED,
  PHX_HAS_SUBMITTED,
  PHX_PARENT_ID,
  PHX_PRIVATE,
  PHX_ROOT_ID,
  PHX_SKIP,
  PHX_VIEW_SELECTOR,
  PHX_NO_FEEDBACK_CLASS,
  CHECKABLE_INPUTS,
  FOCUSABLE_INPUTS,
  PHX_REF,
  PHX_READONLY,
  PHX_DISABLED,
  PHX_EVENT_CLASSES,
  PHX_DISABLE_WITH_RESTORE,
  PHX_REMOVE,
  PHX_TRIGGER_ACTION,
  PHX_UPDATE,
  PHX_FEEDBACK_FOR,
  PHX_STATIC,
} from "./constants";
import morphdom from "morphdom";
import { clone, detectDuplicateIds, logError, maybe } from "./util";
import { Socket } from "phoenix";

export const DOM = {
  byId(id) {
    return document.getElementById(id) || logError(`no id found for ${id}`);
  },

  removeClass(el, className) {
    el.classList.remove(className);
    if (el.classList.length === 0) {
      el.removeAttribute("class");
    }
  },

  all(node, query): HTMLElement[] {
    return Array.from(node.querySelectorAll(query));
  },

  each(node, query, callback) {
    this.all(node, query).forEach(callback);
  },

  findFirstComponentNode(node, cid) {
    return node.querySelector(`[${PHX_COMPONENT}="${cid}"]`);
  },

  findComponentNodeList(node, cid) {
    return this.all(node, `[${PHX_COMPONENT}="${cid}"]`);
  },

  findPhxChildrenInFragment(html, parentId) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return this.findPhxChildren(template.content, parentId);
  },

  isPhxUpdate(el, phxUpdate, updateTypes) {
    return (
      el.getAttribute && updateTypes.indexOf(el.getAttribute(phxUpdate)) >= 0
    );
  },

  findPhxChildren(el, parentId) {
    return this.all(el, `${PHX_VIEW_SELECTOR}[${PHX_PARENT_ID}="${parentId}"]`);
  },

  findParentCIDs(node, cids) {
    const initial = new Set(cids);
    return cids.reduce((acc, cid) => {
      const selector = `[${PHX_COMPONENT}="${cid}"] [${PHX_COMPONENT}]`;
      this.all(node, selector)
        .map((el) => parseInt(el.getAttribute(PHX_COMPONENT)))
        .forEach((childCID) => acc.delete(childCID));

      return acc;
    }, initial);
  },

  private(el, key) {
    return el[PHX_PRIVATE] && el[PHX_PRIVATE][key];
  },

  deletePrivate(el, key) {
    el[PHX_PRIVATE] && delete el[PHX_PRIVATE][key];
  },

  putPrivate(el, key, value) {
    if (!el[PHX_PRIVATE]) {
      el[PHX_PRIVATE] = {};
    }
    el[PHX_PRIVATE][key] = value;
  },

  copyPrivates(target, source) {
    if (source[PHX_PRIVATE]) {
      target[PHX_PRIVATE] = clone(source[PHX_PRIVATE]);
    }
  },

  putTitle(str) {
    const titleEl = document.querySelector("title");
    const { prefix, suffix } = titleEl.dataset;
    document.title = `${prefix || ""}${str}${suffix || ""}`;
  },

  debounce(
    el,
    event,
    phxDebounce,
    defaultDebounce,
    phxThrottle,
    defaultThrottle,
    callback
  ) {
    let debounce = el.getAttribute(phxDebounce);
    let throttle = el.getAttribute(phxThrottle);
    if (debounce === "") {
      debounce = defaultDebounce;
    }
    if (throttle === "") {
      throttle = defaultThrottle;
    }
    const value = debounce || throttle;
    switch (value) {
      case null: {
        return callback();
      }

      case "blur": {
        if (this.private(el, DEBOUNCE_BLUR)) {
          return;
        }
        el.addEventListener("blur", () => callback());
        this.putPrivate(el, DEBOUNCE_BLUR, value);
        return;
      }

      default: {
        const timeout = parseInt(value);
        if (isNaN(timeout)) {
          return logError(`invalid throttle/debounce value: ${value}`);
        }
        if (throttle && event.type === "keydown") {
          const prevKey = this.private(el, DEBOUNCE_PREV_KEY);
          this.putPrivate(el, DEBOUNCE_PREV_KEY, event.key);
          if (prevKey !== event.key) {
            return callback();
          }
        }
        if (this.private(el, DEBOUNCE_TIMER)) {
          return;
        }

        const clearTimer = (e) => {
          if (
            throttle &&
            e.type === PHX_CHANGE_EVENT &&
            e.detail.triggeredBy.name === el.name
          ) {
            return;
          }
          clearTimeout(this.private(el, DEBOUNCE_TIMER));
          this.deletePrivate(el, DEBOUNCE_TIMER);
        };
        const debounceCallback = () => {
          if (el.form) {
            el.form.removeEventListener(PHX_CHANGE_EVENT, clearTimer);
            el.form.removeEventListener("submit", clearTimer);
          }
          el.removeEventListener("blur", this.private(el, DEBOUNCE_BLUR_TIMER));
          this.deletePrivate(el, DEBOUNCE_BLUR_TIMER);
          this.deletePrivate(el, DEBOUNCE_TIMER);
          if (!throttle) {
            callback();
          }
        };
        const blurCallback = () => {
          clearTimeout(this.private(el, DEBOUNCE_TIMER));
          debounceCallback();
        };
        this.putPrivate(
          el,
          DEBOUNCE_TIMER,
          setTimeout(debounceCallback, timeout)
        );
        el.addEventListener("blur", blurCallback);
        this.putPrivate(el, DEBOUNCE_BLUR_TIMER, blurCallback);
        if (el.form) {
          el.form.addEventListener(PHX_CHANGE_EVENT, clearTimer);
          el.form.addEventListener("submit", clearTimer);
        }
        if (throttle) {
          callback();
        }
      }
    }
  },

  discardError(container, el, phxFeedbackFor) {
    const field = el.getAttribute && el.getAttribute(phxFeedbackFor);
    const input = field && container.querySelector(`#${field}`);
    if (!input) {
      return;
    }

    if (
      !(
        this.private(input, PHX_HAS_FOCUSED) ||
        this.private(input.form, PHX_HAS_SUBMITTED)
      )
    ) {
      el.classList.add(PHX_NO_FEEDBACK_CLASS);
    }
  },

  isPhxChild(node) {
    return node.getAttribute && node.getAttribute(PHX_PARENT_ID);
  },

  dispatchEvent(target, eventString, detail = {}) {
    const event = new CustomEvent(eventString, {
      bubbles: true,
      cancelable: true,
      detail: detail,
    });
    target.dispatchEvent(event);
  },

  cloneNode(node, html?) {
    if (typeof html === "undefined") {
      return node.cloneNode(true);
    } else {
      const cloned = node.cloneNode(false);
      cloned.innerHTML = html;
      return cloned;
    }
  },

  mergeAttrs(target, source, exclude = []) {
    const sourceAttrs = source.attributes;
    for (let i = sourceAttrs.length - 1; i >= 0; i--) {
      const name = sourceAttrs[i].name;
      if (exclude.indexOf(name) < 0) {
        target.setAttribute(name, source.getAttribute(name));
      }
    }

    const targetAttrs = target.attributes;
    for (let i = targetAttrs.length - 1; i >= 0; i--) {
      const name = targetAttrs[i].name;
      if (!source.hasAttribute(name)) {
        target.removeAttribute(name);
      }
    }
  },

  mergeFocusedInput(target, source) {
    // skip selects because FF will reset highlighted index for any setAttribute
    if (!(target instanceof HTMLSelectElement)) {
      DOM.mergeAttrs(target, source, ["value"]);
    }
    if (source.readOnly) {
      target.setAttribute("readonly", "true");
    } else {
      target.removeAttribute("readonly");
    }
  },

  restoreFocus(focused, selectionStart, selectionEnd) {
    if (!DOM.isTextualInput(focused)) {
      return;
    }
    const wasFocused = focused.matches(":focus");
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

  isFormInput(el) {
    return /^(?:input|select|textarea)$/i.test(el.tagName);
  },

  syncAttrsToProps(el) {
    if (
      el instanceof HTMLInputElement &&
      CHECKABLE_INPUTS.indexOf(el.type.toLocaleLowerCase()) >= 0
    ) {
      el.checked = el.getAttribute("checked") !== null;
    }
  },

  isTextualInput(el) {
    return FOCUSABLE_INPUTS.indexOf(el.type) >= 0;
  },

  isNowTriggerFormExternal(el, phxTriggerExternal) {
    return el.getAttribute && el.getAttribute(phxTriggerExternal) !== null;
  },

  undoRefs(ref, container) {
    DOM.each(container, `[${PHX_REF}]`, (el) =>
      this.syncPendingRef(ref, el, el)
    );
  },

  syncPendingRef(ref, fromEl, toEl) {
    const fromRefAttr = fromEl.getAttribute && fromEl.getAttribute(PHX_REF);
    if (fromRefAttr === null) {
      return true;
    }

    const fromRef = parseInt(fromRefAttr);
    if (ref !== null && ref >= fromRef) {
      [fromEl, toEl].forEach((el) => {
        // remove refs
        el.removeAttribute(PHX_REF);
        // retore inputs
        if (el.getAttribute(PHX_READONLY) !== null) {
          el.readOnly = false;
          el.removeAttribute(PHX_READONLY);
        }
        if (el.getAttribute(PHX_DISABLED) !== null) {
          el.disabled = false;
          el.removeAttribute(PHX_DISABLED);
        }
        // remove classes
        PHX_EVENT_CLASSES.forEach((className) =>
          DOM.removeClass(el, className)
        );
        // restore disables
        const disableRestore = el.getAttribute(PHX_DISABLE_WITH_RESTORE);
        if (disableRestore !== null) {
          el.innerText = disableRestore;
          el.removeAttribute(PHX_DISABLE_WITH_RESTORE);
        }
      });
      return true;
    } else {
      PHX_EVENT_CLASSES.forEach((className) => {
        fromEl.classList.contains(className) && toEl.classList.add(className);
      });
      toEl.setAttribute(PHX_REF, fromEl.getAttribute(PHX_REF));
      return !(DOM.isFormInput(fromEl) || /submit/i.test(fromEl.type));
    }
  },
};

export class DOMPatch {
  private view: any;
  private liveSocket: Socket;
  private readonly container: any;
  private id: any;
  private html: any;
  private readonly rootID: any;
  private readonly targetCID: any;
  private readonly ref: any;
  private readonly cidPatch: boolean;
  private callbacks: {
    afteradded: any[];
    beforeupdated: any[];
    beforeadded: any[];
    beforephxChildAdded: any[];
    beforediscarded: any[];
    afterphxChildAdded: any[];
    afterdiscarded: any[];
    afterupdated: any[];
  };
  constructor(view, container, id, html, targetCID, ref?) {
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

  before(kind, callback) {
    this.callbacks[`before${kind}`].push(callback);
  }
  after(kind, callback) {
    this.callbacks[`after${kind}`].push(callback);
  }

  trackBefore(kind, ...args) {
    this.callbacks[`before${kind}`].forEach((callback) => callback(...args));
  }

  trackAfter(kind, ...args) {
    this.callbacks[`after${kind}`].forEach((callback) => callback(...args));
  }

  markPrunableContentForRemoval() {
    DOM.each(
      this.container,
      `[phx-update=append] > *, [phx-update=prepend] > *`,
      (el) => {
        el.setAttribute(PHX_REMOVE, "");
      }
    );
  }

  perform() {
    const { view, liveSocket, container, html } = this;
    const targetContainer = this.isCIDPatch()
      ? this.targetCIDContainer()
      : container;
    if (this.isCIDPatch() && !targetContainer) {
      return;
    }

    const focused = liveSocket.getActiveElement();
    const { selectionStart, selectionEnd } = focused;
    const phxUpdate = liveSocket.binding(PHX_UPDATE);
    const phxFeedbackFor = liveSocket.binding(PHX_FEEDBACK_FOR);
    const phxTriggerExternal = liveSocket.binding(PHX_TRIGGER_ACTION);
    const added = [];
    const updates = [];
    const appendPrependUpdates = [];

    const diffHTML = liveSocket.time("premorph container prep", () => {
      return this.buildDiffHTML(container, html, phxUpdate, targetContainer);
    });

    this.trackBefore("added", container);
    this.trackBefore("updated", container, container);

    liveSocket.time("morphdom", () => {
      morphdom(targetContainer, diffHTML, {
        childrenOnly: targetContainer.getAttribute(PHX_COMPONENT) === null,
        onBeforeNodeAdded: (el) => {
          //input handling
          DOM.discardError(targetContainer, el, phxFeedbackFor);
          this.trackBefore("added", el);
          return el;
        },
        onNodeAdded: (el) => {
          if (DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
            (el as HTMLFormElement).submit();
          }
          // nested view handling
          if (DOM.isPhxChild(el) && view.ownsElement(el)) {
            this.trackAfter("phxChildAdded", el);
          }
          added.push(el);
          return el;
        },
        onNodeDiscarded: (el) => {
          this.trackAfter("discarded", el);
        },
        onBeforeNodeDiscarded: (el) => {
          if (
            (el as HTMLElement).getAttribute &&
            (el as HTMLElement).getAttribute(PHX_REMOVE) !== null
          ) {
            return true;
          }
          if (
            DOM.isPhxUpdate(el.parentNode, phxUpdate, ["append", "prepend"])
          ) {
            return false;
          }
          if (this.skipCIDSibling(el)) {
            return false;
          }
          this.trackBefore("discarded", el);
          // nested view handling
          if (DOM.isPhxChild(el)) {
            liveSocket.destroyViewByEl(el);
            return true;
          }
        },
        onElUpdated: (el) => {
          if (DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
            (el as HTMLFormElement).submit();
          }
          updates.push(el);
        },
        onBeforeElUpdated: (fromEl, toEl) => {
          if (this.skipCIDSibling(toEl)) {
            return false;
          }
          if (fromEl.getAttribute(phxUpdate) === "ignore") {
            this.trackBefore("updated", fromEl, toEl);
            DOM.mergeAttrs(fromEl, toEl);
            updates.push(fromEl);
            return false;
          }
          if (
            (fromEl as HTMLInputElement).type === "number" &&
            (fromEl as HTMLInputElement).validity &&
            (fromEl as HTMLInputElement).validity.badInput
          ) {
            return false;
          }
          if (!DOM.syncPendingRef(this.ref, fromEl, toEl)) {
            return false;
          }

          // nested view handling
          if (DOM.isPhxChild(toEl)) {
            const prevStatic = fromEl.getAttribute(PHX_STATIC);
            DOM.mergeAttrs(fromEl, toEl);
            fromEl.setAttribute(PHX_STATIC, prevStatic);
            fromEl.setAttribute(PHX_ROOT_ID, this.rootID);
            return false;
          }

          // input handling
          DOM.copyPrivates(toEl, fromEl);
          DOM.discardError(targetContainer, toEl, phxFeedbackFor);

          const isFocusedFormEl =
            focused && fromEl.isSameNode(focused) && DOM.isFormInput(fromEl);
          if (isFocusedFormEl && !this.forceFocusedSelectUpdate(fromEl, toEl)) {
            this.trackBefore("updated", fromEl, toEl);
            DOM.mergeFocusedInput(fromEl, toEl);
            DOM.syncAttrsToProps(fromEl);
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
            if (DOM.isPhxUpdate(toEl, phxUpdate, ["append", "prepend"])) {
              const isAppend = toEl.getAttribute(phxUpdate) === "append";
              const idsBefore = Array.from(fromEl.children).map(
                (child) => child.id
              );
              const newIds = Array.from(toEl.children).map((child) => child.id);
              const isOnlyNewIds =
                isAppend && !newIds.find((id) => idsBefore.indexOf(id) >= 0);

              if (!isOnlyNewIds) {
                appendPrependUpdates.push([toEl.id, idsBefore]);
              }
            }
            DOM.syncAttrsToProps(toEl);
            this.trackBefore("updated", fromEl, toEl);
            return true;
          }
        },
      });
    });

    if (liveSocket.isDebugEnabled()) {
      detectDuplicateIds();
    }

    if (appendPrependUpdates.length > 0) {
      liveSocket.time("post-morph append/prepend restoration", () => {
        appendPrependUpdates.forEach(([containerID, idsBefore]) => {
          const el = DOM.byId(containerID);
          const isAppend = el?.getAttribute(phxUpdate) === "append";
          if (isAppend) {
            idsBefore.reverse().forEach((id) => {
              maybe(document.getElementById(id), (child) =>
                el.insertBefore(child, el.firstChild)
              );
            });
          } else {
            idsBefore.forEach((id) => {
              maybe(document.getElementById(id), (child) =>
                el.appendChild(child)
              );
            });
          }
        });
      });
    }

    liveSocket.silenceEvents(() =>
      DOM.restoreFocus(focused, selectionStart, selectionEnd)
    );
    DOM.dispatchEvent(document, "phx:update");
    added.forEach((el) => this.trackAfter("added", el));
    updates.forEach((el) => this.trackAfter("updated", el));

    return true;
  }

  forceFocusedSelectUpdate(fromEl, toEl) {
    return fromEl.multiple === true || fromEl.innerHTML != toEl.innerHTML;
  }

  isCIDPatch() {
    return this.cidPatch;
  }

  skipCIDSibling(el) {
    return (
      el.nodeType === Node.ELEMENT_NODE && el.getAttribute(PHX_SKIP) !== null
    );
  }

  targetCIDContainer() {
    if (!this.isCIDPatch()) {
      return;
    }
    const [first, ...rest] = DOM.findComponentNodeList(
      this.container,
      this.targetCID
    );
    if (rest.length === 0) {
      return first;
    } else {
      return first && first.parentNode;
    }
  }

  // builds HTML for morphdom patch
  // - for full patches of LiveView or a component with a single
  //   root node, simply returns the HTML
  // - for patches of a component with multiple root nodes, the
  //   parent node becomes the target container and non-component
  //   siblings are marked as skip.
  buildDiffHTML(container, html, phxUpdate, targetContainer) {
    const isCIDPatch = this.isCIDPatch();
    const isCIDWithSingleRoot =
      isCIDPatch &&
      targetContainer.getAttribute(PHX_COMPONENT) === this.targetCID.toString();
    if (!isCIDPatch || isCIDWithSingleRoot) {
      return html;
    } else {
      // component patch with multiple CID roots
      let diffContainer = null;
      const template = document.createElement("template");
      diffContainer = DOM.cloneNode(targetContainer);
      const [firstComponent, ...rest] = DOM.findComponentNodeList(
        diffContainer,
        this.targetCID
      );
      template.innerHTML = html;
      rest.forEach((el) => el.remove());
      Array.from(diffContainer.childNodes).forEach((child: Element) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          child.getAttribute(PHX_COMPONENT) !== this.targetCID.toString()
        ) {
          child.setAttribute(PHX_SKIP, "");
          child.innerHTML = "";
        }
      });
      Array.from(template.content.childNodes).forEach((el) =>
        diffContainer.insertBefore(el, firstComponent)
      );
      firstComponent.remove();
      return diffContainer.outerHTML;
    }
  }
}
