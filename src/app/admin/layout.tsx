"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Images, ChartColumnDecreasing, LogOut } from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard/users", icon: Users },
    { label: "Calculator", href: "/dashboard/media", icon: Images },
    { label: "Import", href: "/dashboard/stats", icon: ChartColumnDecreasing },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <main className="w-full min-h-[95vh] mx-auto p-4 flex flex-col">
        {children}
      </main>

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

      <motion.div>
        <Button
          onClick={() => {}}
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
    </div>
  );
}
