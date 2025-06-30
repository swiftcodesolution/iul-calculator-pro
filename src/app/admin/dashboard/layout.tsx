"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

type AdminDashboardLayoutProps = {
  children: React.ReactNode;
};

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen w-full flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}

        <div className="fixed right-0 bottom-0 p-8">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
