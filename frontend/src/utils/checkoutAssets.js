const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const isBrowser = typeof window !== "undefined";

const parseAbsoluteUrl = (value) => {
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const isPublicHttpsUrl = (value) => {
  const url = parseAbsoluteUrl(value);
  if (!url) return false;

  if (url.protocol !== "https:") {
    return false;
  }

  if (LOCAL_HOSTNAMES.has(url.hostname)) {
    return false;
  }

  return true;
};

export const getRazorpayImageUrl = () => {
  const configuredLogo = String(import.meta.env.VITE_RAZORPAY_LOGO_URL || "").trim();

  if (!configuredLogo) {
    return undefined;
  }

  if (isPublicHttpsUrl(configuredLogo)) {
    return configuredLogo;
  }

  if (isBrowser) {
    console.warn(
      `Ignoring VITE_RAZORPAY_LOGO_URL "${configuredLogo}" because Razorpay can only fetch public HTTPS image URLs.`
    );
  }

  return undefined;
};
