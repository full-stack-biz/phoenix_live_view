export const CONSECUTIVE_RELOADS = "consecutive-reloads";
export const MAX_RELOADS = 10;
export const RELOAD_JITTER = [1000, 3000];
export const FAILSAFE_JITTER = 30000;
export const PHX_VIEW = "data-phx-view";
export const PHX_EVENT_CLASSES = [
  "phx-click-loading",
  "phx-change-loading",
  "phx-submit-loading",
  "phx-keydown-loading",
  "phx-keyup-loading",
  "phx-blur-loading",
  "phx-focus-loading",
];
export const PHX_COMPONENT = "data-phx-component";
export const PHX_LIVE_LINK = "data-phx-link";
export const PHX_TRACK_STATIC = "track-static"
export const PHX_LINK_STATE = "data-phx-link-state";
export const PHX_REF = "data-phx-ref";
export const PHX_SKIP = "data-phx-skip";
export const PHX_REMOVE = "data-phx-remove";
export const PHX_PAGE_LOADING = "page-loading";
export const PHX_CONNECTED_CLASS = "phx-connected";
export const PHX_DISCONNECTED_CLASS = "phx-disconnected";
export const PHX_NO_FEEDBACK_CLASS = "phx-no-feedback";
export const PHX_ERROR_CLASS = "phx-error";
export const PHX_PARENT_ID = "data-phx-parent-id";
export const PHX_VIEW_SELECTOR = `[${PHX_VIEW}]`;
export const PHX_MAIN = `data-phx-main`;
export const PHX_ROOT_ID = `data-phx-root-id`;
export const PHX_TRIGGER_ACTION = "trigger-action";
export const PHX_FEEDBACK_FOR = "feedback-for";
export const PHX_HAS_FOCUSED = "phx-has-focused";
export const FOCUSABLE_INPUTS = [
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
export const CHECKABLE_INPUTS = ["checkbox", "radio"];
export const PHX_HAS_SUBMITTED = "phx-has-submitted";
export const PHX_SESSION = "data-phx-session";
export const PHX_STATIC = "data-phx-static";
export const PHX_READONLY = "data-phx-readonly";
export const PHX_DISABLED = "data-phx-disabled";
export const PHX_DISABLE_WITH = "disable-with";
export const PHX_DISABLE_WITH_RESTORE = "data-phx-disable-with-restore";
export const PHX_HOOK = "hook";
export const PHX_DEBOUNCE = "debounce";
export const PHX_THROTTLE = "throttle";
export const PHX_CHANGE_EVENT = "phx-change";
export const PHX_UPDATE = "update";
export const PHX_KEY = "key";
export const PHX_PRIVATE = "phxPrivate";
export const PHX_AUTO_RECOVER = "auto-recover";
export const PHX_LV_DEBUG = "phx:live-socket:debug";
export const PHX_LV_PROFILE = "phx:live-socket:profiling";
export const PHX_LV_LATENCY_SIM = "phx:live-socket:latency-sim";
export const LOADER_TIMEOUT = 1;
export const BEFORE_UNLOAD_LOADER_TIMEOUT = 200;
export const BINDING_PREFIX = "phx-";
export const PUSH_TIMEOUT = 30000;
export const LINK_HEADER = "x-requested-with";
export const DEBOUNCE_BLUR = "debounce-blur";
export const DEBOUNCE_TIMER = "debounce-timer";
export const DEBOUNCE_BLUR_TIMER = "debounce-blur-timer";
export const DEBOUNCE_PREV_KEY = "debounce-prev-key";
export const DEFAULTS = {
  debounce: 300,
  throttle: 300,
};

// Rendered
export const DYNAMICS = "d";
export const STATIC = "s";
export const COMPONENTS = "c";
