import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Racing Hub — Your Ultimate Formula 1 Guide",
  description:
    "Everything you need to know about Formula 1: drivers, teams, race calendar, standings, where to watch, and more. Your complete F1 companion.",
  keywords: ["F1", "Formula 1", "racing", "drivers", "teams", "calendar", "standings"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
