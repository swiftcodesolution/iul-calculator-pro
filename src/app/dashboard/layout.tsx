// app/dashboard/layout.tsx
"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Suspense } from "react";
import NavBar from "@/components/dashboard/NavBar";
import SubscriptionChecker from "@/components/dashboard/SubscriptionChecker";

export const dynamic = "force-dynamic";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <SubscriptionChecker>
          <div className="min-h-screen w-full flex flex-col">
            <main className="w-full min-h-[95vh] mx-auto p-4 flex flex-col">
              {children}
            </main>
            <Suspense fallback={<div>Loading navigation...</div>}>
              <NavBar />
            </Suspense>
          </div>
        </SubscriptionChecker>
      </Suspense>
    </DndProvider>
  );
}
