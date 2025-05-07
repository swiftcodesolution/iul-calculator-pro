// src/app/dashboard/layout.tsx
"use client";

import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = [
    { label: "Home", href: "/dashboard/home", icon: Home },
    { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
    { label: "Import", href: "/dashboard/import", icon: Upload },
    { label: "Data", href: "/dashboard/data", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              width={300}
              height={300}
              src="/logo.png"
              alt="IUL Calculator Pro Logo"
              className="h-15 w-full object-contain"
            />
            {/* <h1 className="text-xl font-bold text-gray-900">Company Name</h1> */}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Log out">
              <LogOut className="h-5 w-5 text-gray-600" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">{children}</main>

      {/* Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={`Navigate to ${item.label}`}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={pathname === item.href ? "default" : "outline"}
                size="icon"
                className="rounded-none"
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
