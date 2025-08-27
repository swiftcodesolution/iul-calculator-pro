"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, DollarSign, Star } from "lucide-react";

interface Subscription {
  status: "none" | "trialing" | "active" | "expired";
  planType: "trial" | "monthly" | "annual" | null;
  endDate: string | null;
}

interface UserData {
  foreverFree: boolean;
}

export default function SubscriptionStatusCard() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;

      try {
        // Fetch subscription data
        const subResponse = await fetch("/api/subscribe");
        if (!subResponse.ok) throw new Error("Failed to fetch subscription");
        const subData = await subResponse.json();
        setSubscription(subData);

        // Fetch user data for foreverFree
        const userResponse = await fetch(`/api/users/${session.user.id}`);
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUserData({ foreverFree: userData.foreverFree });
      } catch (err) {
        setError("Error loading subscription status");
        console.error(err);
      }
    }
    fetchData();
  }, [session]);

  return (
    <Card className="flex-1 p-2 gap-2 my-2">
      <CardContent className="p-0 space-y-2 h-full">
        <h3 className="font-bold text-sm">Subscription Status</h3>
        {error && <p className="text-red-500">{error}</p>}
        {subscription && userData && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {userData.foreverFree ? (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 120 },
                  },
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm">
                    <span className="font-semibold">Premium Forever:</span> You
                    have lifetime free access!
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Lifetime Access
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 120 },
                  },
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <p className="text-sm">
                    <span className="font-semibold">Plan:</span>{" "}
                    {subscription.planType
                      ? subscription.planType.charAt(0).toUpperCase() +
                        subscription.planType.slice(1)
                      : "None"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-sm">
                    <span className="font-semibold">Status:</span>{" "}
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                    {subscription.endDate && subscription.status === "trialing"
                      ? ` (Ends: ${new Date(
                          subscription.endDate
                        ).toLocaleDateString()})`
                      : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
