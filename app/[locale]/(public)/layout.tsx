import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicActivityTracker } from "@/components/analytics/public-activity-tracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <PublicActivityTracker />
      <main>{children}</main>
      <Footer />
    </>
  );
}
