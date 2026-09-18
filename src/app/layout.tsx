import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Jost } from "next/font/google";
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
  title: "Käsityöt — The hand, unhurried.",
  description:
    "A marketplace for the slow trades. Objects made slowly, by people we know by name. Signed, traceable, and meant to outlive their first owner.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="max-w-full overflow-x-hidden bg-ink">{children}</body>
    </html>
  );
}
