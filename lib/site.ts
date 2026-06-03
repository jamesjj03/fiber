import { FiberRepProfile } from "@/lib/fiberReps";

export const SITE_NAME = "The Fiber Crew";
export const DEFAULT_SITE_URL = "https://thefibercrew.com";

export function getSiteUrl(requestUrl?: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    return configured.startsWith("http") ? configured.replace(/\/$/, "") : `https://${configured.replace(/\/$/, "")}`;
  }

  if (requestUrl) {
    return new URL(requestUrl).origin;
  }

  return DEFAULT_SITE_URL;
}

export function getRepUrl(rep: FiberRepProfile, requestUrl?: string) {
  if (rep.redirectUrl) return rep.redirectUrl;

  return `${getSiteUrl(requestUrl)}/${rep.slug}`;
}
