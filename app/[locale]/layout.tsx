import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleHtmlAttributes } from "@/components/seo/locale-html-attributes";
import { getMergedMessagesForLocaleCached } from "@/lib/firestore/public-site-copy";
import { loadMessageFileForLocale } from "@/lib/messages/public-defaults";
import { logError } from "@/lib/log/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();
  setRequestLocale(locale);

  let messages;
  try {
    messages = await getMessages();
  } catch (err) {
    logError("layout", "getMessages_failed_fallback", { locale }, err);
    try {
      messages = await getMergedMessagesForLocaleCached(locale);
    } catch {
      messages = await loadMessageFileForLocale(locale);
    }
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages as AbstractIntlMessages}
    >
      <LocaleHtmlAttributes />
      {children}
    </NextIntlClientProvider>
  );
}
