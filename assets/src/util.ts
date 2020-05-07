import { PHX_VIEW_SELECTOR } from "./constants";

export const logError = (msg, obj?) => {
  console.error && console.error(msg, obj);
  return undefined;
};

// wraps value in closure or returns closure
export const closure = (val) =>
  typeof val === "function"
    ? val
    : function () {
        return val;
      };

export const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export function detectDuplicateIds() {
  const ids = new Set();
  const elems = document.querySelectorAll("*[id]");
  for (let i = 0, len = elems.length; i < len; i++) {
    if (ids.has(elems[i].id)) {
      console.error(
        `Multiple IDs detected: ${elems[i].id}. Ensure unique element ids.`
      );
    } else {
      ids.add(elems[i].id);
    }
  }
}

export const maybe = (el, callback) => el && callback(el);

export const isObject = (obj) => {
  return obj !== null && typeof obj === "object" && !(obj instanceof Array);
};

export const isEqualObj = (obj1, obj2) =>
  JSON.stringify(obj1) === JSON.stringify(obj2);

export const isEmpty = (obj) => {
  return Object.keys(obj || {}).length == 0;
};

export const serializeForm = (form, meta = {}) => {
  const formData: FormData = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, val] of formData.entries()) {
    params.append(key, val.toString());
  }
  for (const metaKey in meta) {
    params.append(metaKey, meta[metaKey]);
  }

  return params.toString();
};

export const closestPhxBinding = (el, binding, borderEl?) => {
  do {
    if (el.matches(`[${binding}]`)) {
      return el;
    }
    el = el.parentElement || el.parentNode;
  } while (
    el !== null &&
    el.nodeType === 1 &&
    !((borderEl && borderEl.isSameNode(el)) || el.matches(PHX_VIEW_SELECTOR))
  );
  return null;
};
