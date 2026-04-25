import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { getMergedMessagesForLocaleCached } from "@/lib/firestore/public-site-copy";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  const messages = await getMergedMessagesForLocaleCached(locale);

  return {
    locale,
    messages: messages as unknown as AbstractIntlMessages,
  };
});
