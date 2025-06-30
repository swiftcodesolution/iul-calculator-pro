"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DollarSign, CheckCircle, Loader2, Info } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const isPageLoading = !!isLoading;

  const plans = [
    {
      type: "trial",
      name: "60-Day Trial",
      price: "Free",
      description:
        "No charge with 1 IUL sale every 2 months. Auto-cancels otherwise.",
    },
    {
      type: "monthly",
      name: "Monthly",
      price: "$89/month",
      description: "Flexible billing with 60-day trial",
    },
    {
      type: "annual",
      name: "Annual",
      price: "$1,000/year",
      description: "Best value with 60-day trial",
    },
  ];

  const handleSubscribe = async (plan: string) => {
    if (status !== "authenticated") {
      toast.error("Please log in to subscribe.");
      router.push("/");
      return;
    }

    setIsLoading(plan);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      if (plan === "trial") {
        toast.success("Trial activated! Complete 1 IUL sale every 2 months.");
        router.push("/dashboard/home");
      } else if (data.url) {
        router.push(data.url);
      } else {
        throw new Error("No checkout URL");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      // Type guard to safely access error.message
      const message =
        error instanceof Error ? error.message : "Subscription failed";
      toast.error(message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto p-4 h-[90vh] flex flex-col items-center"
    >
      <Card className="w-full max-w-4xl border shadow-lg">
        <CardHeader>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-2xl font-bold text-center"
          >
            Choose Your Subscription Plan
          </motion.h2>
          <p className="text-center text-gray-500">
            All plans include a 60-day trial.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={cn(
                    "flex flex-col p-6 border rounded-lg hover:shadow-md transition-shadow",
                    plan.type === "annual" && "border-primary"
                  )}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-2xl font-bold mb-2">{plan.price}</p>
                  <p className="text-gray-500 mb-4">{plan.description}</p>
                  {plan.type === "trial" && (
                    <p className="text-sm text-gray-400 mb-4 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Requires 1 IUL sale every 2 months.
                    </p>
                  )}
                  <Button
                    variant={plan.type === "annual" ? "default" : "outline"}
                    className="mt-auto w-full"
                    onClick={() => handleSubscribe(plan.type)}
                    disabled={isPageLoading}
                  >
                    {isLoading === plan.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {plan.type === "trial" ? "Start Trial" : "Select Plan"}
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
