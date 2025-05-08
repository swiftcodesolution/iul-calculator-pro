"use client";

import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
// import Image from "next/image";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const navItems = [
    { label: "Home", href: "/dashboard/home", icon: Home },
    { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
    { label: "Import", href: "/dashboard/import", icon: Upload },
    { label: "Data", href: "/dashboard/data", icon: Database },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100">
        {/* <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                width={150}
                height={50}
                src="/logo.png"
                alt="IUL Calculator Pro Logo"
                className="object-contain"
              />
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Log out">
                <LogOut className="h-5 w-5 text-gray-600" />
              </Link>
            </Button>
          </div>
        </header> */}

        <main className="container mx-auto p-2">{children}</main>

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

        <Link href="/" aria-label="Logout">
          <motion.div>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-0 -translate-x-1/2 rounded-none"
            >
              <LogOut />
            </Button>
          </motion.div>
        </Link>
      </div>
    </DndProvider>
  );
}
