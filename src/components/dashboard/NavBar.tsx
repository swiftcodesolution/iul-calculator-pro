"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useFileContext } from "@/context/FileContext";
import { useEffect } from "react";

const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedFileId, setSelectedFileId } = useFileContext();

  const navItems = [
    { label: "Home", href: "/dashboard/home", icon: Home },
    {
      label: "Calculator",
      href: `/dashboard/calculator/${selectedFileId}`,
      icon: Calculator,
    },
    {
      label: "Import",
      href: `/dashboard/import/${selectedFileId}`,
      icon: Upload,
    },
    {
      label: "Data",
      href: `/dashboard/data/${selectedFileId}`,
      icon: Database,
    },
  ];

  useEffect(() => {
    // Check query parameter first
    const fileIdFromQuery = searchParams.get("fileId");
    if (fileIdFromQuery && !selectedFileId) {
      setSelectedFileId(fileIdFromQuery);
      return;
    }
    // Extract fileId from path
    const pathSegments = pathname.split("/");
    const fileIdFromPath = pathSegments[pathSegments.length - 1];
    if (
      fileIdFromPath &&
      !selectedFileId &&
      ["/dashboard/calculator", "/dashboard/import", "/dashboard/data"].some(
        (path) => pathname.startsWith(path)
      )
    ) {
      setSelectedFileId(fileIdFromPath);
    }
  }, [pathname, searchParams, selectedFileId, setSelectedFileId]);

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

  if (pathname === "/dashboard/home") {
    return (
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
    );
  }

  return (
    <>
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
                  whileHover={{ rotate: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        ))}
      </motion.nav>

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
    </>
  );
};

export default NavBar;
