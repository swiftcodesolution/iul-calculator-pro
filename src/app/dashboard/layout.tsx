"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useFileContext } from "@/context/FileContext";
import { useEffect } from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedFileId, setSelectedFileId } = useFileContext();

  const navItems = [
    { label: "Home", href: "/dashboard/home", icon: Home },
    { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
    { label: "Import", href: "/dashboard/import", icon: Upload },
    { label: "Data", href: "/dashboard/data", icon: Database },
  ];

  useEffect(() => {
    const fileId = searchParams.get("fileId");
    if (fileId && !selectedFileId) {
      setSelectedFileId(fileId);
    }
  }, [searchParams, selectedFileId, setSelectedFileId]);

  useEffect(() => {
    const restrictedPaths = [
      "/dashboard/calculator",
      "/dashboard/import",
      "/dashboard/data",
    ];
    const fileId = searchParams.get("fileId");
    if (!selectedFileId && !fileId && restrictedPaths.includes(pathname)) {
      router.push("/dashboard/home");
      toast.error("Please select a file first");
    }
  }, [selectedFileId, pathname, router, searchParams]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      await signOut({ redirect: false });
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error signing out");
      console.error(error);
    }
  };

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
          {navItems.map((item) => {
            const isDisabled =
              item.href !== "/dashboard/home" && !selectedFileId;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Navigate to ${item.label}`}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    toast.error("Please select a file first");
                  }
                }}
                className={`${isDisabled ? "cursor-not-allowed" : ""}`}
              >
                <motion.div
                  whileHover={{ scale: isDisabled ? 1 : 1.15, rotate: 0 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  animate={
                    pathname === item.href && !isDisabled
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
                    className={`rounded-none transition-colors duration-200 ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    disabled={isDisabled}
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
            );
          })}
        </motion.nav>

        {/* Animated Logout Button */}

        <motion.div>
          <Button
            onClick={handleSignOut}
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
    </DndProvider>
  );
}
