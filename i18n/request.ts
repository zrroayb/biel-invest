import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { getMergedMessagesForLocaleCached } from "@/lib/firestore/public-site-copy";
import { loadMessageFileForLocale } from "@/lib/messages/public-defaults";
import { logError, logInfo } from "@/lib/log/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  logInfo("i18n", "load_messages_start", { locale });
  let messages: Record<string, unknown>;
  try {
    messages = await getMergedMessagesForLocaleCached(locale);
  } catch (err) {
    logError("i18n", "load_messages_failed_using_file", { locale }, err);
    messages = await loadMessageFileForLocale(locale);
  }
  logInfo("i18n", "load_messages_ok", {
    locale,
    topLevelKeys: Object.keys(messages as object).length,
  });

  return {
    locale,
    messages: messages as unknown as AbstractIntlMessages,
  };
});
