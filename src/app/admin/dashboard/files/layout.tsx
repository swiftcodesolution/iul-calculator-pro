"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Suspense, useEffect } from "react";
import NavBar from "@/components/dashboard/NavBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AdminFilesLayoutProps = {
  children: React.ReactNode;
};

export default function AdminFilesLayout({ children }: AdminFilesLayoutProps) {
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
        <div className="w-full h-full">
          <main className="p-6 h-full">{children}</main>
          <Suspense fallback={<div>Loading...</div>}>
            <NavBar />
          </Suspense>
        </div>
      </DndProvider>
    </Suspense>
  );
}
