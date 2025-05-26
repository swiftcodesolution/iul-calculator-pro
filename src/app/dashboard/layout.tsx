"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
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
    {
      label: "Data",
      href: "/dashboard/current-plan-full-table",
      icon: Database,
    },
    {
      label: "Data",
      href: "/dashboard/tax-free-plan-full-table",
      icon: Database,
    },
    {
      label: "Data",
      href: "/dashboard/combined-table",
      icon: Database,
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen w-full bg-gray-100 flex flex-col">
        <main className="w-full min-h-[95vh] mx-auto p-4 flex flex-col">
          {children}
        </main>

        {/* Animated Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 120,
            delay: 0.2,
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Navigate to ${item.label}`}
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 0 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  pathname === item.href
                    ? {
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.8, repeat: Infinity },
                      }
                    : {}
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant={pathname === item.href ? "default" : "outline"}
                  size="icon"
                  className="rounded-none transition-colors duration-200 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: pathname === item.href ? 0 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          ))}
        </motion.nav>

        {/* Animated Logout Button */}
        <Link href="/" aria-label="Logout">
          <motion.div>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-0 -translate-x-1/2 rounded-none transition-colors duration-200"
            >
              <motion.div
                whileHover={{ rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <LogOut />
              </motion.div>
            </Button>
          </motion.div>
        </Link>
      </div>
    </DndProvider>
  );
}
