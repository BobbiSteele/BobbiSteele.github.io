import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SideName from "./SideName";
import Copyright from "./Copyright";
import SiteNav from "./SiteNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bobbi Steele",
  description: "Personal site and project pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SideName />
        <SiteNav />
        <Copyright />
        {children}
        <footer
          className="px-6 pb-10 pt-4 text-center text-xs uppercase tracking-[0.25em] text-zinc-500 md:hidden"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          2026 &copy; Bobbi Steele
        </footer>
      </body>
    </html>
  );
}
