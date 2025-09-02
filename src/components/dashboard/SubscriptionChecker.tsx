// components/dashboard/SubscriptionChecker.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SubscriptionChecker({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );
  const [foreverFree, setForeverFree] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/subscribe");
      if (!response.ok) throw new Error("Failed to fetch subscription");
      const data = await response.json();
      setSubscriptionStatus(data.status);

      const userResponse = await fetch(`/api/users/${session?.user?.id}`);
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      setForeverFree(userData.foreverFree || false);
    } catch (error) {
      console.error("Error fetching subscription or user data:", error);
      setSubscriptionStatus(null);
      setForeverFree(false);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) fetchSubscription();
  }, [status, session?.user?.id, fetchSubscription]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.id &&
      pathname === "/dashboard/home" &&
      searchParams.get("success") === "true"
    ) {
      setIsLoading(true);
      fetchSubscription();
    }
  }, [pathname, searchParams, status, session?.user?.id, fetchSubscription]);

  if (
    status === "loading" ||
    isLoading ||
    subscriptionStatus === null ||
    foreverFree === null
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );
  }

  if (
    pathname !== "/dashboard/subscribe" &&
    !foreverFree &&
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

  return <>{children}</>;
}
