import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { getMergedMessagesForLocaleCached } from "@/lib/firestore/public-site-copy";
import { logInfo } from "@/lib/log/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  logInfo("i18n", "load_messages_start", { locale });
  const messages = await getMergedMessagesForLocaleCached(locale);
  logInfo("i18n", "load_messages_ok", {
    locale,
    topLevelKeys: Object.keys(messages as object).length,
  });

  return {
    locale,
    messages: messages as unknown as AbstractIntlMessages,
  };
});
