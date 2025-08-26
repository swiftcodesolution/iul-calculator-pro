"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Suspense, useEffect, useState } from "react";
import NavBar from "@/components/dashboard/NavBar";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      const fetchSubscription = async () => {
        try {
          const response = await fetch("/api/subscription");
          const data = await response.json();
          setSubscriptionStatus(data.status);
        } catch (error) {
          console.error("Error fetching subscription:", error);
          setSubscriptionStatus(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubscription();
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );
  }

  // Skip subscription check for /dashboard/subscribe
  if (
    pathname !== "/dashboard/subscribe" &&
    subscriptionStatus !== "active" &&
    subscriptionStatus !== "trialing"
  ) {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Required</DialogTitle>
            <DialogDescription>
              Your subscription is not active. Please subscribe to continue
              using the app.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => router.push("/dashboard/subscribe")}>
            Go to Subscription Page
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Suspense>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen w-full flex flex-col">
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
