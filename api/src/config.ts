import { ServiceUnavailableException } from "@nestjs/common";

function configuredUrl(value: string, setting: string) {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new ServiceUnavailableException(`${setting} must be a valid absolute URL.`);
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new ServiceUnavailableException(`${setting} must be an HTTP(S) URL without credentials.`);
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new ServiceUnavailableException(`${setting} must use HTTPS in production.`);
  }
  return url;
}

export function getWebOrigin() {
  return configuredUrl(process.env.WEB_ORIGIN ?? "http://localhost:3000", "WEB_ORIGIN").origin;
}

export function getAppUrl() {
  return configuredUrl(
    process.env.APP_URL ?? process.env.WEB_ORIGIN ?? "http://localhost:3000",
    "APP_URL",
  ).origin;
}

export function getApiPublicUrl() {
  return configuredUrl(
    process.env.API_PUBLIC_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:4000",
    "API_PUBLIC_URL",
  ).origin;
}
