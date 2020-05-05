import {
  COMPONENTS,
  DYNAMICS,
  PHX_COMPONENT,
  PHX_SKIP,
  STATIC,
} from "./constants";
import { isObject, logError } from "./util";

export class Rendered {
  private readonly viewId: any;
  private rendered: any;
  constructor(viewId, rendered) {
    this.viewId = viewId;
    this.replaceRendered(rendered);
  }

  parentViewId() {
    return this.viewId;
  }

  toString(onlyCids) {
    return this.recursiveToString(
      this.rendered,
      this.rendered[COMPONENTS],
      onlyCids
    );
  }

  recursiveToString(
    rendered,
    components = rendered[COMPONENTS] || {},
    onlyCids
  ) {
    onlyCids = onlyCids ? new Set(onlyCids) : null;
    const output = { buffer: "", components: components, onlyCids: onlyCids };
    this.toOutputBuffer(rendered, output);
    return output.buffer;
  }

  componentCIDs(diff) {
    return Object.keys(diff[COMPONENTS] || {}).map((i) => parseInt(i));
  }

  isComponentOnlyDiff(diff) {
    if (!diff[COMPONENTS]) {
      return false;
    }
    return (
      Object.keys(diff).filter((k) => k !== "title" && k !== COMPONENTS)
        .length === 0
    );
  }

  mergeDiff(diff) {
    if (!diff[COMPONENTS] && this.isNewFingerprint(diff)) {
      this.replaceRendered(diff);
    } else {
      this.recursiveMerge(this.rendered, diff);
    }
  }

  recursiveMerge(target, source) {
    Object.keys(source).forEach((key) => {
      const val = source[key];
      const targetVal = target[key];
      if (isObject(val) && isObject(targetVal)) {
        if (targetVal[DYNAMICS] && !val[DYNAMICS]) {
          delete targetVal[DYNAMICS];
        }
        this.recursiveMerge(targetVal, val);
      } else {
        target[key] = val;
      }
    });
  }

  componentToString(cid) {
    return this.recursiveCIDToString(this.rendered[COMPONENTS], cid);
  }

  pruneCIDs(cids) {
    cids.forEach((cid) => delete this.rendered[COMPONENTS][cid]);
  }

  // private

  get() {
    return this.rendered;
  }

  replaceRendered(rendered) {
    this.rendered = rendered;
    this.rendered[COMPONENTS] = this.rendered[COMPONENTS] || {};
  }

  isNewFingerprint(diff = {}) {
    return !!diff[STATIC];
  }

  toOutputBuffer(rendered, output) {
    if (rendered[DYNAMICS]) {
      return this.comprehensionToBuffer(rendered, output);
    }
    const { [STATIC]: statics } = rendered;

    output.buffer += statics[0];
    for (let i = 1; i < statics.length; i++) {
      this.dynamicToBuffer(rendered[i - 1], output);
      output.buffer += statics[i];
    }
  }

  comprehensionToBuffer(rendered, output) {
    const { [DYNAMICS]: dynamics, [STATIC]: statics } = rendered;

    for (let d = 0; d < dynamics.length; d++) {
      const dynamic = dynamics[d];
      output.buffer += statics[0];
      for (let i = 1; i < statics.length; i++) {
        this.dynamicToBuffer(dynamic[i - 1], output);
        output.buffer += statics[i];
      }
    }
  }

  dynamicToBuffer(rendered, output) {
    if (typeof rendered === "number") {
      output.buffer += this.recursiveCIDToString(
        output.components,
        rendered,
        output.onlyCids
      );
    } else if (isObject(rendered)) {
      this.toOutputBuffer(rendered, output);
    } else {
      output.buffer += rendered;
    }
  }

  recursiveCIDToString(components, cid, onlyCids?) {
    const component =
      components[cid] || logError(`no component for CID ${cid}`, components);
    const template = document.createElement("template");
    template.innerHTML = this.recursiveToString(
      component,
      components,
      onlyCids
    );
    const container = template.content;
    const skip = onlyCids && !onlyCids.has(cid);
    Array.from(container.children).forEach((child, i) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        child.setAttribute(PHX_COMPONENT, cid);
        if (!child.id) {
          child.id = `${this.parentViewId()}-${cid}-${i}`;
        }
        if (skip) {
          child.setAttribute(PHX_SKIP, "");
          child.innerHTML = "";
        }
      } else {
        if (child.nodeValue.trim() !== "") {
          logError(
            `only HTML element tags are allowed at the root of components.\n\n` +
              `got: "${child.nodeValue.trim()}"\n\n` +
              `within:\n`,
            template.innerHTML.trim()
          );

          const span = document.createElement("span");
          span.innerText = child.nodeValue;
          span.setAttribute(PHX_COMPONENT, cid);
          child.replaceWith(span);
        } else {
          child.remove();
        }
      }
    });

    return template.innerHTML;
  }
}
