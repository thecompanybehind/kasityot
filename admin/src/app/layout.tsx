import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Jost } from "next/font/google";
import { cookies } from "next/headers";
import { THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-jost",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Kasityot — Owner panel",
  description: "Private administration for the Kasityot marketplace.",
  // The panel must never be indexed.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read on the server so the first paint is already in the chosen theme.
  const theme =
    (await cookies()).get(THEME_COOKIE)?.value === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="max-w-full overflow-x-hidden bg-ink">{children}</body>
    </html>
  );
}
