const NOISE_PATTERNS = [
  "download the react devtools for a better development experience",
  "refused to get unsafe header \"x-rtb-fingerprint-id\"",
  "refused to get unsafe header \"request-id\"",
  "\"serviceworker\" must be a dictionary in your web app manifest",
  "serviceworker must be a dictionary in your web app manifest",
  "permissions policy violation: accelerometer is not allowed in this document",
  "the devicemotion events are blocked by permissions policy",
  "the deviceorientation events are blocked by permissions policy",
  "mixed content: the page at",
  "images loaded lazily and replaced with placeholders",
  "was preloaded using link preload but not used within a few seconds",
  "net::err_connection_refused",
  "failed to load resource: the server responded with a status of 500",
  "failed to load resource: net::err_connection_refused"
];

const NOISE_SOURCES = [
  "checkout-static-next.razorpay.com",
  "api.razorpay.com",
  "api.sardine.ai",
  "browser.sentry-cdn.com",
  "localhost:7070",
  "localhost:37857"
];

const isNoise = (args) => {
  const text = args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ")
    .toLowerCase();

  return NOISE_PATTERNS.some((pattern) => text.includes(pattern))
    || NOISE_SOURCES.some((source) => text.includes(source));
};

const shouldSuppressEvent = (event) => {
  const parts = [
    event?.message,
    event?.reason?.message,
    event?.reason,
    event?.filename,
    event?.target?.src,
    event?.target?.href
  ].filter(Boolean);

  return isNoise(parts);
};

export function quietExternalCheckoutNoise() {
  if (!import.meta.env.DEV) return;

  const originalLog = console.log;
  const originalInfo = console.info;
  const originalDebug = console.debug;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => {
    if (isNoise(args)) return;
    originalLog(...args);
  };

  console.info = (...args) => {
    if (isNoise(args)) return;
    originalInfo(...args);
  };

  console.debug = (...args) => {
    if (isNoise(args)) return;
    originalDebug(...args);
  };

  console.warn = (...args) => {
    if (isNoise(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (isNoise(args)) return;
    originalError(...args);
  };

  window.addEventListener("error", (event) => {
    if (shouldSuppressEvent(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    if (shouldSuppressEvent(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}
