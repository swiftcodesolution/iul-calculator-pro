import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AnimatePresence } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import { FileProvider } from "@/context/FileContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IUL Calculator Pro",
  description: "A modern SAAS platform for IUL and 401k comparisons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gray-100 text-gray-900"
        )}
      >
        <SessionProviderWrapper>
          <FileProvider>
            <AnimatePresence mode="wait" initial={false}>
              <main className="min-h-dvh">{children}</main>
            </AnimatePresence>
          </FileProvider>
          <Toaster />
        </SessionProviderWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
