import {
  COMPONENTS,
  CONSECUTIVE_RELOADS,
  PHX_COMPONENT,
  PHX_CONNECTED_CLASS,
  PHX_DISCONNECTED_CLASS,
  PHX_PARENT_ID,
  PHX_ROOT_ID,
  PHX_SESSION,
  PHX_STATIC,
  PHX_VIEW,
  PHX_VIEW_SELECTOR,
  PHX_ERROR_CLASS,
  PHX_REF,
  PHX_HOOK,
  PHX_UPDATE,
  BEFORE_UNLOAD_LOADER_TIMEOUT,
  PHX_PAGE_LOADING,
  PUSH_TIMEOUT,
  PHX_DISABLE_WITH,
  PHX_DISABLE_WITH_RESTORE,
  CHECKABLE_INPUTS,
  PHX_CHANGE_EVENT,
  PHX_DISABLED,
  PHX_READONLY,
  PHX_AUTO_RECOVER,
  PHX_HAS_SUBMITTED,
} from "assets/src/constants";
import { DOM, DOMPatch } from "assets/src/dom";
import { Browser } from "assets/src/browser";
import {
  closestPhxBinding,
  isEmpty,
  isEqualObj,
  logError,
  maybe,
  serializeForm,
} from "assets/src/util";
import { Socket } from "phoenix";
import { Rendered } from "assets/src/rendered";

export class View {
  id: string;
  private readonly liveSocket: Socket;
  private flash: any;
  private readonly parent: View;
  private root: View;
  el: Element;
  private readonly view: string;
  private ref: number;
  private href: string;
  private childJoins: number;
  private pendingDiffs: any[];
  private loaderTimer: number;
  private joinCount: number;
  private joinPending: boolean;
  private joinCallback: () => void;
  private destroyed: boolean;
  private stopCallback: () => void;
  private pendingJoinOps: any[];
  private readonly viewHooks: {};
  private readonly children: {};
  private readonly channel: any;
  private rendered: Rendered;

  constructor(el, liveSocket, parentView, href?, flash?) {
    this.liveSocket = liveSocket;
    this.flash = flash;
    this.parent = parentView;
    this.root = parentView ? parentView.root : this;
    this.el = el;
    this.id = this.el.id;
    this.view = this.el.getAttribute(PHX_VIEW);
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
    this.channel = this.liveSocket.channel(`lv:${this.id}`, () => {
      return {
        url: this.href,
        params: this.liveSocket.params(this.view),
        session: this.getSession(),
        static: this.getStatic(),
        flash: this.flash,
        joins: this.joinCount,
      };
    });
    this.showLoader(this.liveSocket.loaderTimeout);
    this.bindChannel();
  }

  isMain() {
    return this.liveSocket.main === this;
  }

  name() {
    return this.view;
  }

  isConnected() {
    return this.channel.canPush();
  }

  getSession() {
    return this.el.getAttribute(PHX_SESSION);
  }

  getStatic() {
    const val = this.el.getAttribute(PHX_STATIC);
    return val === "" ? null : val;
  }

  destroy(callback = function () {}) {
    this.destroyAllChildren();
    this.destroyed = true;
    delete this.root.children[this.id];
    if (this.parent) {
      delete this.root.children[this.parent.id][this.id];
    }
    clearTimeout(this.loaderTimer);
    const onFinished = () => {
      callback();
      for (const id in this.viewHooks) {
        this.destroyHook(this.viewHooks[id]);
      }
    };

    this.log("destroyed", () => ["the child has been removed from the parent"]);
    this.channel
      .leave()
      .receive("ok", onFinished)
      .receive("error", onFinished)
      .receive("timeout", onFinished);
  }

  setContainerClasses(...classes) {
    this.el.classList.remove(
      PHX_CONNECTED_CLASS,
      PHX_DISCONNECTED_CLASS,
      PHX_ERROR_CLASS
    );
    this.el.classList.add(...classes);
  }

  isLoading() {
    return this.el.classList.contains(PHX_DISCONNECTED_CLASS);
  }

  showLoader(timeout?) {
    clearTimeout(this.loaderTimer);
    if (timeout) {
      this.loaderTimer = setTimeout(() => this.showLoader(), timeout);
    } else {
      for (const id in this.viewHooks) {
        this.viewHooks[id].__trigger__("disconnected");
      }
      this.setContainerClasses(PHX_DISCONNECTED_CLASS);
    }
  }

  hideLoader() {
    clearTimeout(this.loaderTimer);
    this.setContainerClasses(PHX_CONNECTED_CLASS);
  }

  triggerReconnected() {
    for (const id in this.viewHooks) {
      this.viewHooks[id].__trigger__("reconnected");
    }
  }

  log(kind, msgCallback) {
    this.liveSocket.log(this, kind, msgCallback);
  }

  onJoin(resp) {
    const { rendered } = resp;
    this.joinCount++;
    this.childJoins = 0;
    this.joinPending = true;
    this.flash = null;

    this.log("join", () => ["", rendered]);
    if (rendered.title) {
      DOM.putTitle(rendered.title);
    }
    Browser.dropLocal(this.name(), CONSECUTIVE_RELOADS);
    this.rendered = new Rendered(this.id, rendered);
    const html = this.renderContainer(null, "join");
    this.dropPendingRefs();
    const forms = this.formsForRecovery(html);

    if (this.joinCount > 1 && forms.length > 0) {
      forms.forEach((form, i) => {
        this.pushFormRecovery(form, (resp) => {
          if (i === forms.length - 1) {
            this.onJoinComplete(resp, html);
          }
        });
      });
    } else {
      this.onJoinComplete(resp, html);
    }
  }

  dropPendingRefs() {
    DOM.each(this.el, `[${PHX_REF}]`, (el) => el.removeAttribute(PHX_REF));
  }

  onJoinComplete({ live_patch }, html) {
    if (this.joinCount > 1 || (this.parent && !this.parent.isJoinPending())) {
      return this.applyJoinPatch(live_patch, html);
    }

    const newChildren = DOM.findPhxChildrenInFragment(
      html,
      this.id
    ).filter((c) => this.joinChild(c));
    if (newChildren.length === 0) {
      if (this.parent) {
        this.root.pendingJoinOps.push([
          this,
          () => this.applyJoinPatch(live_patch, html),
        ]);
        this.parent.ackJoin(this);
      } else {
        this.onAllChildJoinsComplete();
        this.applyJoinPatch(live_patch, html);
      }
    } else {
      this.root.pendingJoinOps.push([
        this,
        () => this.applyJoinPatch(live_patch, html),
      ]);
    }
  }

  attachTrueDocEl() {
    this.el = DOM.byId(this.id);
    this.el.setAttribute(PHX_ROOT_ID, this.root.id);
  }

  applyJoinPatch(live_patch, html) {
    this.attachTrueDocEl();
    const patch = new DOMPatch(this, this.el, this.id, html, null);
    patch.markPrunableContentForRemoval();
    this.joinPending = false;
    this.performPatch(patch);
    this.joinNewChildren();
    DOM.each(this.el, `[${this.binding(PHX_HOOK)}]`, (hookEl) => {
      const hook = this.addHook(hookEl);
      if (hook) {
        hook.__trigger__("mounted");
      }
    });

    this.applyPendingUpdates();

    if (live_patch) {
      const { kind, to } = live_patch;
      this.liveSocket.historyPatch(to, kind);
    }
    this.hideLoader();
    if (this.joinCount > 1) {
      this.triggerReconnected();
    }
    this.stopCallback();
  }

  performPatch(patch) {
    const destroyedCIDs = [];
    let phxChildrenAdded = false;
    const updatedHookIds = new Set();

    patch.after("added", (el) => {
      const newHook = this.addHook(el);
      if (newHook) {
        newHook.__trigger__("mounted");
      }
    });

    patch.after("phxChildAdded", () => (phxChildrenAdded = true));

    patch.before("updated", (fromEl, toEl) => {
      const hook = this.getHook(fromEl);
      const isIgnored =
        hook && fromEl.getAttribute(this.binding(PHX_UPDATE)) === "ignore";
      if (
        hook &&
        !fromEl.isEqualNode(toEl) &&
        !(isIgnored && isEqualObj(fromEl.dataset, toEl.dataset))
      ) {
        updatedHookIds.add(fromEl.id);
        hook.__trigger__("beforeUpdate");
      }
    });

    patch.after("updated", (el) => {
      const hook = this.getHook(el);
      if (hook && updatedHookIds.has(el.id)) {
        hook.__trigger__("updated");
      }
    });

    patch.before("discarded", (el) => {
      const hook = this.getHook(el);
      if (hook) {
        hook.__trigger__("beforeDestroy");
      }
    });

    patch.after("discarded", (el) => {
      const cid = this.componentID(el);
      if (typeof cid === "number" && destroyedCIDs.indexOf(cid) === -1) {
        destroyedCIDs.push(cid);
      }
      const hook = this.getHook(el);
      hook && this.destroyHook(hook);
    });

    patch.perform();
    this.maybePushComponentsDestroyed(destroyedCIDs);

    return phxChildrenAdded;
  }

  joinNewChildren() {
    DOM.findPhxChildren(this.el, this.id).forEach((el) => this.joinChild(el));
  }

  getChildById(id) {
    return this.root.children[this.id][id];
  }

  getDescendentByEl(el) {
    if (el.id === this.id) {
      return this;
    } else {
      return this.children[el.getAttribute(PHX_PARENT_ID)][el.id];
    }
  }

  destroyDescendent(id) {
    Object.keys(this.root.children).forEach((parentId) => {
      Object.keys(this.root.children[parentId]).forEach((childId) => {
        if (childId === id) {
          return this.root.children[parentId][childId].destroy();
        }
      });
    });
  }

  joinChild(el) {
    const child = this.getChildById(el.id);
    if (!child) {
      const view = new View(el, this.liveSocket, this);
      this.root.children[this.id][view.id] = view;
      view.join();
      this.childJoins++;
      return true;
    }
  }

  isJoinPending() {
    return this.joinPending;
  }

  ackJoin(_child) {
    this.childJoins--;

    if (this.childJoins === 0) {
      if (this.parent) {
        this.parent.ackJoin(this);
      } else {
        this.onAllChildJoinsComplete();
      }
    }
  }

  onAllChildJoinsComplete() {
    this.joinCallback();
    this.pendingJoinOps.forEach(([view, op]) => {
      if (!view.isDestroyed()) {
        op();
      }
    });
    this.pendingJoinOps = [];
  }

  update(diff, cidAck?, ref?) {
    if (isEmpty(diff) && ref === null) {
      return;
    }
    if (diff.title) {
      DOM.putTitle(diff.title);
    }
    if (this.isJoinPending() || this.liveSocket.hasPendingLink()) {
      return this.pendingDiffs.push({ diff, cid: cidAck, ref });
    }

    this.log("update", () => ["", diff]);
    this.rendered.mergeDiff(diff);
    let phxChildrenAdded = false;

    // when we don't have an acknowledgement CID and the diff only contains
    // component diffs, then walk components and patch only the parent component
    // containers found in the diff. Otherwise, patch entire LV container.
    if (typeof cidAck === "number") {
      this.liveSocket.time("component ack patch complete", () => {
        if (this.componentPatch(diff[COMPONENTS][cidAck], cidAck, ref)) {
          phxChildrenAdded = true;
        }
      });
    } else if (this.rendered.isComponentOnlyDiff(diff)) {
      this.liveSocket.time("component patch complete", () => {
        const parentCids = DOM.findParentCIDs(
          this.el,
          this.rendered.componentCIDs(diff)
        );
        parentCids.forEach((parentCID) => {
          if (
            this.componentPatch(diff[COMPONENTS][parentCID], parentCID, ref)
          ) {
            phxChildrenAdded = true;
          }
        });
      });
    } else if (!isEmpty(diff)) {
      this.liveSocket.time("full patch complete", () => {
        const html = this.renderContainer(diff, "update");
        const patch = new DOMPatch(this, this.el, this.id, html, null, ref);
        phxChildrenAdded = this.performPatch(patch);
      });
    }

    DOM.undoRefs(ref, this.el);
    if (phxChildrenAdded) {
      this.joinNewChildren();
    }
  }

  renderContainer(diff, kind) {
    return this.liveSocket.time(`toString diff (${kind})`, () => {
      const tag = this.el.tagName;
      const cids = diff ? this.rendered.componentCIDs(diff) : null;
      const html = this.rendered.toString(cids);
      return `<${tag}>${html}</${tag}>`;
    });
  }

  componentPatch(diff, cid, ref) {
    if (isEmpty(diff)) return false;
    const html = this.rendered.componentToString(cid);
    const patch = new DOMPatch(this, this.el, this.id, html, cid, ref);
    return this.performPatch(patch);
  }

  getHook(el) {
    return this.viewHooks[ViewHook.elementID(el)];
  }

  addHook(el) {
    if (ViewHook.elementID(el) || !el.getAttribute) {
      return;
    }
    const hookName = el.getAttribute(this.binding(PHX_HOOK));
    if (hookName && !this.ownsElement(el)) {
      return;
    }
    const callbacks = this.liveSocket.getHookCallbacks(hookName);

    if (callbacks) {
      const hook = new ViewHook(this, el, callbacks);
      this.viewHooks[ViewHook.elementID(hook.el)] = hook;
      return hook;
    } else if (hookName !== null) {
      logError(`unknown hook found for "${hookName}"`, el);
    }
  }

  destroyHook(hook) {
    hook.__trigger__("destroyed");
    delete this.viewHooks[ViewHook.elementID(hook.el)];
  }

  applyPendingUpdates() {
    this.pendingDiffs.forEach(({ diff, cid, ref }) =>
      this.update(diff, cid, ref)
    );
    this.pendingDiffs = [];
  }

  onChannel(event, cb) {
    this.liveSocket.onChannel(this.channel, event, (resp) => {
      if (this.isJoinPending()) {
        this.root.pendingJoinOps.push([this, () => cb(resp)]);
      } else {
        cb(resp);
      }
    });
  }

  bindChannel() {
    this.onChannel("diff", (diff) => this.update(diff));
    this.onChannel("redirect", ({ to, flash }) =>
      this.onRedirect({ to, flash })
    );
    this.onChannel("live_patch", (redir) => this.onLivePatch(redir));
    this.onChannel("live_redirect", (redir) => this.onLiveRedirect(redir));
    this.onChannel("session", ({ token }) =>
      this.el.setAttribute(PHX_SESSION, token)
    );
    this.channel.onError((reason) => this.onError(reason));
    this.channel.onClose(() => this.onError({ reason: "closed" }));
  }

  destroyAllChildren() {
    Object.keys(this.root.children[this.id]).forEach((id) => {
      this.getChildById(id).destroy();
    });
  }

  onLiveRedirect(redir) {
    const { to, kind, flash } = redir;
    const url = this.expandURL(to);
    this.liveSocket.historyRedirect(url, kind, flash);
  }

  onLivePatch(redir) {
    const { to, kind } = redir;
    this.href = this.expandURL(to);
    this.liveSocket.historyPatch(to, kind);
  }

  expandURL(to) {
    return to.startsWith("/")
      ? `${window.location.protocol}//${window.location.host}${to}`
      : to;
  }

  onRedirect({ to, flash }) {
    this.liveSocket.redirect(to, flash);
  }

  isDestroyed() {
    return this.destroyed;
  }

  join(callback?) {
    if (!this.parent) {
      this.stopCallback = this.liveSocket.withPageLoading({
        to: this.href,
        kind: "initial",
      });
    }
    this.joinCallback = () => callback && callback(this, this.joinCount);
    this.liveSocket.wrapPush(() => {
      return this.channel
        .join()
        .receive("ok", (data) => this.onJoin(data))
        .receive("error", (resp) => this.onJoinError(resp))
        .receive("timeout", () => this.onJoinError({ reason: "timeout" }));
    });
  }

  onJoinError(resp) {
    if (resp.redirect || resp.live_redirect) {
      this.channel.leave();
    }
    if (resp.redirect) {
      return this.onRedirect(resp.redirect);
    }
    if (resp.live_redirect) {
      return this.onLiveRedirect(resp.live_redirect);
    }
    this.log("error", () => ["unable to join", resp]);
    return this.liveSocket.reloadWithJitter(this);
  }

  onError(reason) {
    if (this.isJoinPending()) {
      return this.liveSocket.reloadWithJitter(this);
    }
    this.destroyAllChildren();
    this.log("error", () => ["view crashed", reason]);
    this.liveSocket.onViewError(this);
    (document.activeElement as HTMLElement).blur();
    if (this.liveSocket.isUnloaded()) {
      this.showLoader(BEFORE_UNLOAD_LOADER_TIMEOUT);
    } else {
      this.displayError();
    }
  }

  displayError() {
    if (this.isMain()) {
      DOM.dispatchEvent(window, "phx:page-loading-start", {
        to: this.href,
        kind: "error",
      });
    }
    this.showLoader();
    this.setContainerClasses(PHX_DISCONNECTED_CLASS, PHX_ERROR_CLASS);
  }

  pushWithReply(
    refGenerator,
    event,
    payload,
    onReply = function (_resp: any) {}
  ) {
    const [ref, [el]] = refGenerator ? refGenerator() : [null, []];
    let onLoadingDone = function () {};
    if (el && el.getAttribute(this.binding(PHX_PAGE_LOADING)) !== null) {
      onLoadingDone = this.liveSocket.withPageLoading({
        kind: "element",
        target: el,
      });
    }

    if (typeof payload.cid !== "number") {
      delete payload.cid;
    }
    return this.liveSocket.wrapPush(() => {
      return this.channel
        .push(event, payload, PUSH_TIMEOUT)
        .receive("ok", (resp) => {
          if (resp.diff || ref !== null) {
            this.update(resp.diff || {}, payload.cid, ref);
          }
          if (resp.redirect) {
            this.onRedirect(resp.redirect);
          }
          if (resp.live_patch) {
            this.onLivePatch(resp.live_patch);
          }
          if (resp.live_redirect) {
            this.onLiveRedirect(resp.live_redirect);
          }
          onLoadingDone();
          onReply(resp);
        });
    });
  }

  putRef(elements, event) {
    const newRef = this.ref++;
    const disableWith = this.binding(PHX_DISABLE_WITH);

    elements.forEach((el) => {
      el.classList.add(`phx-${event}-loading`);
      el.setAttribute(PHX_REF, String(newRef));
      const disableText = el.getAttribute(disableWith);
      if (disableText !== null) {
        if (!el.getAttribute(PHX_DISABLE_WITH_RESTORE)) {
          el.setAttribute(PHX_DISABLE_WITH_RESTORE, el.innerText);
        }
        el.innerText = disableText;
      }
    });
    return [newRef, elements];
  }

  componentID(el) {
    const cid = el.getAttribute && el.getAttribute(PHX_COMPONENT);
    return cid ? parseInt(cid) : null;
  }

  targetComponentID(target, targetCtx) {
    if (target.getAttribute(this.binding("target"))) {
      return this.closestComponentID(targetCtx);
    } else {
      return null;
    }
  }

  closestComponentID(targetCtx) {
    if (targetCtx) {
      return maybe(
        targetCtx.closest(`[${PHX_COMPONENT}]`),
        (el) => this.ownsElement(el) && this.componentID(el)
      );
    } else {
      return null;
    }
  }

  pushHookEvent(targetCtx, event, payload) {
    this.pushWithReply(null, "event", {
      type: "hook",
      event: event,
      value: payload,
      cid: this.closestComponentID(targetCtx),
    });
  }

  extractMeta(el, meta) {
    const prefix = this.binding("value-");
    for (let i = 0; i < el.attributes.length; i++) {
      const name = el.attributes[i].name;
      if (name.startsWith(prefix)) {
        meta[name.replace(prefix, "")] = el.getAttribute(name);
      }
    }
    if (el.value !== undefined) {
      meta.value = el.value;

      if (
        el.tagName === "INPUT" &&
        CHECKABLE_INPUTS.indexOf(el.type) >= 0 &&
        !el.checked
      ) {
        delete meta.value;
      }
    }
    return meta;
  }

  pushEvent(type, el, targetCtx, phxEvent, meta) {
    this.pushWithReply(() => this.putRef([el], type), "event", {
      type: type,
      event: phxEvent,
      value: this.extractMeta(el, meta),
      cid: this.targetComponentID(el, targetCtx),
    });
  }

  pushKey(keyElement, targetCtx, kind, phxEvent, meta) {
    this.pushWithReply(() => this.putRef([keyElement], kind), "event", {
      type: kind,
      event: phxEvent,
      value: this.extractMeta(keyElement, meta),
      cid: this.targetComponentID(keyElement, targetCtx),
    });
  }

  pushInput(inputEl, targetCtx, phxEvent, eventTarget, callback?) {
    DOM.dispatchEvent(inputEl.form, PHX_CHANGE_EVENT, { triggeredBy: inputEl });
    this.pushWithReply(
      () => this.putRef([inputEl, inputEl.form], "change"),
      "event",
      {
        type: "form",
        event: phxEvent,
        value: serializeForm(inputEl.form, { _target: eventTarget.name }),
        cid: this.targetComponentID(inputEl.form, targetCtx),
      },
      callback
    );
  }

  pushFormSubmit(formEl, targetCtx, phxEvent, onReply) {
    const filterIgnored = (el) =>
      !closestPhxBinding(el, `${this.binding(PHX_UPDATE)}=ignore`, el.form);
    const refGenerator = () => {
      const disables = DOM.all(formEl, `[${this.binding(PHX_DISABLE_WITH)}]`);
      const buttons = DOM.all(formEl, "button").filter(filterIgnored);
      const inputs = DOM.all(formEl, "input").filter(filterIgnored);

      buttons.forEach((button: HTMLButtonElement) => {
        button.setAttribute(PHX_DISABLED, button.disabled.toString());
        button.disabled = true;
      });
      inputs.forEach((input: HTMLInputElement) => {
        input.setAttribute(PHX_READONLY, input.readOnly.toString());
        input.readOnly = true;
      });
      formEl.setAttribute(this.binding(PHX_PAGE_LOADING), "");
      return this.putRef(
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
        value: serializeForm(formEl),
        cid: this.targetComponentID(formEl, targetCtx),
      },
      onReply
    );
  }

  pushFormRecovery(form, callback) {
    this.liveSocket.withinOwners(form, (view, targetCtx) => {
      const input = form.elements[0];
      const phxEvent =
        form.getAttribute(this.binding(PHX_AUTO_RECOVER)) ||
        form.getAttribute(this.binding("change"));
      view.pushInput(input, targetCtx, phxEvent, input, callback);
    });
  }

  pushLinkPatch(href, targetEl, callback?) {
    if (!this.isLoading()) {
      this.showLoader(this.liveSocket.loaderTimeout);
    }
    const linkRef = this.liveSocket.setPendingLink(href);
    const refGen = targetEl ? () => this.putRef([targetEl], "click") : null;

    this.pushWithReply(refGen, "link", { url: href }, (resp) => {
      if (resp.link_redirect) {
        this.liveSocket.replaceMain(href, null, callback, linkRef);
      } else if (this.liveSocket.commitPendingLink(linkRef)) {
        this.href = href;
        this.applyPendingUpdates();
        this.hideLoader();
        this.triggerReconnected();
        callback && callback();
      }
    }).receive("timeout", () => this.liveSocket.redirect(window.location.href));
  }

  formsForRecovery(html) {
    const phxChange = this.binding("change");
    const template = document.createElement("template");
    template.innerHTML = html;

    return DOM.all(this.el, `form[${phxChange}]`)
      .filter((form) => this.ownsElement(form))
      .filter(
        (form) => form.getAttribute(this.binding(PHX_AUTO_RECOVER)) !== "ignore"
      )
      .filter((form) =>
        template.content.querySelector(
          `form[${phxChange}="${form.getAttribute(phxChange)}"]`
        )
      );
  }

  maybePushComponentsDestroyed(destroyedCIDs) {
    const completelyDestroyedCIDs = destroyedCIDs.filter((cid) => {
      return DOM.findComponentNodeList(this.el, cid).length === 0;
    });
    if (completelyDestroyedCIDs.length > 0) {
      this.pushWithReply(
        null,
        "cids_destroyed",
        { cids: completelyDestroyedCIDs },
        () => {
          this.rendered.pruneCIDs(completelyDestroyedCIDs);
        }
      );
    }
  }

  ownsElement(el) {
    return (
      el.getAttribute(PHX_PARENT_ID) === this.id ||
      maybe(el.closest(PHX_VIEW_SELECTOR), (node) => node.id) === this.id
    );
  }

  submitForm(form, targetCtx, phxEvent) {
    DOM.putPrivate(form, PHX_HAS_SUBMITTED, true);
    this.liveSocket.blurActiveElement(this);
    this.pushFormSubmit(form, targetCtx, phxEvent, () => {
      this.liveSocket.restorePreviouslyActiveFocus();
    });
  }

  binding(kind) {
    return this.liveSocket.binding(kind);
  }
}

let viewHookID = 1;
class ViewHook {
  public el: any;
  private __view: any;
  private __liveSocket: any;
  private readonly __callbacks: any;
  private viewName: any;
  private static makeID() {
    return viewHookID++;
  }
  static elementID(el) {
    return el.phxHookId;
  }

  constructor(view, el, callbacks) {
    this.__view = view;
    this.__liveSocket = view.liveSocket;
    this.__callbacks = callbacks;
    this.el = el;
    this.viewName = view.name();
    this.el.phxHookId = ViewHook.makeID();
    Object.keys(this.__callbacks).forEach((key) => {
      this[key] = this.__callbacks[key];
    });
  }

  pushEvent(event, payload = {}) {
    this.__view.pushHookEvent(null, event, payload);
  }

  pushEventTo(phxTarget, event, payload = {}) {
    this.__liveSocket.withinTargets(null, phxTarget, (view, targetCtx) => {
      view.pushHookEvent(targetCtx, event, payload);
    });
  }

  __trigger__(kind) {
    const callback = this.__callbacks[kind];
    callback && callback.call(this);
  }
}
