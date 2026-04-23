import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicActivityTracker } from "@/components/analytics/public-activity-tracker";
import { PriceCurrencyProvider } from "@/components/property/price-currency-provider";
import { getFxRatesForDisplay } from "@/lib/money/fx-rates";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fx = await getFxRatesForDisplay();

  return (
    <>
      <Header />
      <PriceCurrencyProvider initialRates={fx}>
        <PublicActivityTracker />
        <main>{children}</main>
      </PriceCurrencyProvider>
      <Footer />
    </>
  );
}
