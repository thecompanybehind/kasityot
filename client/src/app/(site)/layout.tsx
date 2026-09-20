import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/**
 * Shell for every public page. The admin panel lives outside this group so
 * it never inherits the public header and footer.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
