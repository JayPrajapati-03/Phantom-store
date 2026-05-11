const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";
const RAZORPAY_LOAD_TIMEOUT_MS = 15000;

let razorpayScriptPromise;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only be loaded in a browser"));
  }

  if (typeof window.Razorpay === "function") {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
    const script = existingScript || document.createElement("script");
    let timeoutId;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const fail = (message) => {
      cleanup();
      razorpayScriptPromise = null;
      reject(new Error(message));
    };

    const handleLoad = () => {
      cleanup();

      if (typeof window.Razorpay !== "function") {
        fail("Razorpay SDK loaded but did not expose checkout");
        return;
      }

      script.dataset.loaded = "true";
      resolve(window.Razorpay);
    };

    const handleError = () => {
      fail("Unable to load Razorpay checkout. Check your connection and ad blocker settings.");
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (existingScript?.dataset.loaded === "true") {
      handleLoad();
      return;
    }

    timeoutId = window.setTimeout(() => {
      fail("Razorpay checkout took too long to load. Please try again.");
    }, RAZORPAY_LOAD_TIMEOUT_MS);

    if (!existingScript) {
      script.id = RAZORPAY_SCRIPT_ID;
      script.src = RAZORPAY_CHECKOUT_URL;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return razorpayScriptPromise;
}

export function getRazorpayErrorMessage(error, fallback = "Payment failed. Please try again.") {
  return (
    error?.response?.data?.message ||
    error?.error?.description ||
    error?.description ||
    error?.message ||
    fallback
  );
}
