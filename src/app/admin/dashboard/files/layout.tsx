"use client";

import NavBar from "@/components/dashboard/NavBar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <main className="w-full min-h-[95vh] mx-auto p-0 flex flex-col">
        {children}
      </main>

      <>
        <NavBar />
      </>
    </div>
  );
}
