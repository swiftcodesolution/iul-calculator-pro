"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Suspense, useEffect } from "react";
import NavBar from "@/components/dashboard/NavBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );

  return (
    <Suspense>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen w-full bg-gray-100 flex flex-col">
          <main className="w-full min-h-[95vh] mx-auto p-4 flex flex-col">
            {children}
          </main>
          <Suspense fallback={<div>Loading...</div>}>
            <NavBar />
          </Suspense>
        </div>
      </DndProvider>
    </Suspense>
  );
}
