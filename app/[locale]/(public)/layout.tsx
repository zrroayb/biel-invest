import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicActivityTracker } from "@/components/analytics/public-activity-tracker";
import { PriceCurrencyProvider } from "@/components/property/price-currency-provider";

/** Sync layout: FX loads client-side via provider (faster TTFB than awaiting Frankfurter here). */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <PriceCurrencyProvider>
        <PublicActivityTracker />
        <main>{children}</main>
      </PriceCurrencyProvider>
      <Footer />
    </>
  );
}
