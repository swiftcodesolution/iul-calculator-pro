import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gray-100 text-gray-900"
        )}
      >
        {/* <main className="min-h-dvh">{children}</main> */}
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
