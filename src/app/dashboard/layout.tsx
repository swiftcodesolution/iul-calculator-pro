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
    // { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
    { label: "Calculator", href: "/dashboard/calculator2", icon: Calculator },
    { label: "Import", href: "/dashboard/import", icon: Upload },
    { label: "Data", href: "/dashboard/data", icon: Database },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100">
        {/* Uncomment and animate the header if needed in the future */}
        {/* <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="bg-white shadow-sm"
        >
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
        </motion.header> */}

        <main className="container mx-auto p-2">{children}</main>

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
                whileHover={{ scale: 1.15, rotate: 5 }}
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
                  className="rounded-none transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: pathname === item.href ? 0 : 360 }}
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
                whileHover={{ rotate: 360 }}
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
