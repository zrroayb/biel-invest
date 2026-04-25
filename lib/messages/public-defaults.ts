import "server-only";

import { routing } from "@/i18n/routing";

const LOCALES = routing.locales;

type MessagesModule = { default: Record<string, unknown> };

function normalizeLocale(locale: string) {
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    return routing.defaultLocale;
  }
  return locale;
}

export function stripAdminNamespace(
  messages: Record<string, unknown>,
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- public CMS must not include admin copy
  const { admin, ...rest } = messages;
  return rest;
}

/** Full JSON (including `admin`) for i18n merge. */
export async function loadMessageFileForLocale(
  locale: string,
): Promise<Record<string, unknown>> {
  const loc = normalizeLocale(locale);
  const mod: MessagesModule = (await import(
    `../../messages/${loc}.json`
  )) as MessagesModule;
  return structuredClone(mod.default) as Record<string, unknown>;
}

/** Defaults for the site-content form (no `admin` namespace). */
export async function loadPublicFormBaseForLocale(
  locale: string,
): Promise<Record<string, unknown>> {
  return stripAdminNamespace(await loadMessageFileForLocale(locale));
}
