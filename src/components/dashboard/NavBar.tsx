"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Home, Calculator, Upload, Database } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useFileContext } from "@/context/FileContext";
import { useEffect } from "react";
import { ThemeToggle } from "../ThemeToggle";

const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedFileId, setSelectedFileId } = useFileContext();
  const { data: session } = useSession();

  const navItems = [
    {
      label: "Home",
      href:
        session?.user.role === "admin"
          ? "/admin/dashboard/files"
          : "/dashboard/home",
      icon: Home,
    },
    {
      label: "Calculator",
      href:
        session?.user.role === "admin"
          ? `/admin/dashboard/files/calculator/${selectedFileId}`
          : `/dashboard/calculator/${selectedFileId}`,
      icon: Calculator,
    },
    {
      label: "Import",
      href:
        session?.user.role === "admin"
          ? `/admin/dashboard/files/import/${selectedFileId}`
          : `/dashboard/import/${selectedFileId}`,
      icon: Upload,
    },
    {
      label: "Data",
      href:
        session?.user.role === "admin"
          ? `/admin/dashboard/files/data/${selectedFileId}`
          : `/dashboard/data/${selectedFileId}`,
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
      await signOut({ redirect: true });

      document.cookie =
        "user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";

      toast.success("Signed out successfully");

      router.push("/");
    } catch (error) {
      console.error("Signout error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (
    pathname === "/dashboard/home" ||
    pathname === "/dashboard/downloads-content" ||
    pathname === "/dashboard/training-content" ||
    pathname === "/dashboard/subscribe"
  ) {
    return (
      <motion.div className="flex gap-4 fixed bottom-4 right-0 -translate-x-1/2">
        <ThemeToggle />
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="icon"
          className="bg-white dark:bg-white dark:text-black text-black hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white high-contrast:bg-white high-contrast:text-black high-contrast:hover:bg-white high-contrast:hover:text-white border hover:border-white transition-colors duration-200 cursor-pointer"
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
              whileHover={{ scale: 1.0, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
              animate={
                pathname === item.href
                  ? {
                      scale: [1, 1, 1],
                      transition: { duration: 0.8, repeat: Infinity },
                    }
                  : {}
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                // variant={pathname === item.href ? "default" : "outline"}
                size="icon"
                className="bg-white dark:bg-white dark:text-black text-black hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white high-contrast:bg-white high-contrast:text-black high-contrast:hover:bg-white high-contrast:hover:text-white border hover:border-white transition-colors duration-200 cursor-pointer"
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

      {session?.user.role !== "admin" ? (
        <motion.div className="fixed bottom-4 right-0 -translate-x-1/2 flex items-center gap-4">
          <ThemeToggle />
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="icon"
            className="bg-white dark:bg-white dark:text-black text-black hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white high-contrast:bg-white high-contrast:text-black high-contrast:hover:bg-white high-contrast:hover:text-white border hover:border-white transition-colors duration-200 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <LogOut />
            </motion.div>
          </Button>
        </motion.div>
      ) : (
        <p></p>
      )}
    </>
  );
};

export default NavBar;
