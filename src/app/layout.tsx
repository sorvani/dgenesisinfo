import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "D-Genesis Stats — Fan Info Site",
    template: "%s | D-Genesis Stats",
  },
  description:
    "A fan-curated database of explorer rankings, stats, and skill orbs from D-Genesis: Three Years after the Dungeons Appeared.",
  keywords: [
    "D-Genesis",
    "light novel",
    "WDARL",
    "explorer rankings",
    "skill orbs",
    "dungeon",
    "fan database",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), sans-serif" }}>
        <Navbar />
        <main className="page-content">
          <div className="container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
