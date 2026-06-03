import repsJson from "@/data/reps.json";
import { FiberConfig, normalizeFiberConfig } from "@/lib/fiberConfig";

export type FiberRepProfile = {
  slug: string;
  name: string;
  fullName?: string;
  role?: string;
  city?: string;
  phoneLabel?: string;
  phoneHref?: string;
  email?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  photoUrl?: string;
  photoAlt?: string;
  accent?: string;
  frontier?: string;
  redirectUrl?: string;
  textBody?: string;
  tagline?: string;
  heroHeadline?: string;
  heroBody?: string;
  heroNote?: string;
  cardNote?: string;
};

export const FIBER_REPS = repsJson as FiberRepProfile[];
export const DEFAULT_FIBER_REP = FIBER_REPS[0];

export function getFiberRep(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  return FIBER_REPS.find((rep) => rep.slug === normalizedSlug);
}

export function getHostedFiberReps() {
  return FIBER_REPS.filter((rep) => !rep.redirectUrl);
}

export function getFiberRepStaticParams() {
  return FIBER_REPS.map((rep) => ({ rep: rep.slug }));
}

export function getEditStaticParams() {
  return getHostedFiberReps().map((rep) => ({ rep: rep.slug }));
}

export function applyFiberRepToConfig(config: Partial<FiberConfig>, rep: FiberRepProfile = DEFAULT_FIBER_REP): FiberConfig {
  const normalized = normalizeFiberConfig(config);
  const phoneHref = rep.phoneHref === undefined ? normalized.contact.phoneHref : normalizePhoneHref(rep.phoneHref);
  const phoneLabel = rep.phoneLabel === undefined ? normalized.contact.phoneLabel : rep.phoneLabel;
  const email = rep.email === undefined ? normalized.contact.email : rep.email;
  const photoUrl = rep.photoUrl === undefined ? normalized.hero.photoUrl : rep.photoUrl;
  const photoAlt = rep.photoAlt || `${rep.name}, local fiber rep`;
  const headline = rep.heroHeadline || `Hey, I'm ${rep.name}`;
  const body = rep.heroBody || "I compare fiber quotes and help make the switch simple.";
  const textBody = rep.textBody || `Hey ${rep.name}, can you help me compare my current internet with fiber?`;

  const withRep = normalizeFiberConfig({
    ...normalized,
    theme: {
      ...normalized.theme,
      accent: rep.accent || normalized.theme.accent,
      frontier: rep.frontier || normalized.theme.frontier,
    },
    hero: {
      ...normalized.hero,
      kicker: "The Fiber Crew",
      headline,
      body,
      jjuNote: rep.heroNote || "",
      photoUrl,
      photoAlt,
      cardNote: rep.cardNote || rep.tagline || "",
    },
    contact: {
      ...normalized.contact,
      phoneLabel,
      phoneHref,
      email,
      textBody,
    },
    process: {
      ...normalized.process,
      steps: normalized.process.steps.map((step) => replaceRepMentions(step, rep.name)),
    },
    faq: {
      ...normalized.faq,
      items: normalized.faq.items.map((item) => ({
        question: replaceRepMentions(item.question, rep.name),
        answer: replaceRepMentions(item.answer, rep.name),
      })),
    },
  });

  return {
    ...withRep,
    hero: {
      ...withRep.hero,
      photoUrl,
      photoAlt,
      jjuNote: rep.heroNote || "",
    },
    contact: {
      ...withRep.contact,
      phoneLabel,
      phoneHref,
      email,
      textBody,
    },
  };
}

export function repPasscode(rep: FiberRepProfile) {
  return `${rep.slug}69`;
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizePhoneHref(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function replaceRepMentions(value: string, name: string) {
  return value
    .replace(/\btext JJ\b/g, `text ${name}`)
    .replace(/\bText JJ\b/g, `Text ${name}`)
    .replace(/\bJJ can\b/g, `${name} can`);
}
