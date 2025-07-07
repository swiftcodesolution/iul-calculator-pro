"use client";

import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { Calendar, DollarSign } from "lucide-react";

interface Subscription {
  status: "none" | "trialing" | "active" | "expired";
  planType: "trial" | "monthly" | "annual" | null;
  endDate: string | null;
}

export default function SubscriptionStatusCard() {
  const { data: session } = useSession();
  //   const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  //   const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!session?.user?.id) return;
      try {
        const response = await fetch("/api/subscribe");
        if (!response.ok) throw new Error("Failed to fetch subscription");
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError("Error loading subscription status");
        console.error(err);
      }
    }
    fetchSubscription();
  }, [session]);

  //   const handleManageSubscription = () => {
  //     router.push("/dashboard/subscribe");
  //   };

  return (
    <Card className="flex-1 p-2 gap-2 my-2">
      <CardContent className="p-0 space-y-2 h-full">
        <h3 className="font-bold text-sm">Subscription Status</h3>
        {error && <p className="text-red-500">{error}</p>}
        {subscription && (
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
          </motion.div>
        )}
        {/* <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleManageSubscription}
            disabled={loading}
          >
            {loading ? "Loading..." : "Manage Subscription"}
          </Button>
        </motion.div> */}
      </CardContent>
    </Card>
  );
}
