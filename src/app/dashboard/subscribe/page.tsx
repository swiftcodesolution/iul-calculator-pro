"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DollarSign, CheckCircle, Loader2, Info, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SubscriptionPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<"active" | "expired" | "none">(
    "none"
  );
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/trial-status")
        .then((res) => res.json())
        .then((data) => setTrialStatus(data.status))
        .catch((err) => console.error("Error fetching trial status:", err));
    }
  }, [status]);

  /*
  const plans = [
    {
      type: "trial",
      name: "60-Day Trial",
      price: "Free",
      description:
        "No charge with 1 IUL sale every 2 months. Auto-cancels otherwise.",
      show: trialStatus === "none",
    },
    {
      type: "monthly",
      name: "Monthly",
      price: "$89/month",
      description: "Flexible billing with 60-day trial",
      show: true,
    },
    {
      type: "annual",
      name: "Annual",
      price: "$800/year",
      description: "Best value with 60-day trial",
      show: true,
    },
    {
      type: "contact-admin",
      name: "Connect with Admin",
      price: "Free",
      description: "Confirm IUL sale to extend trial or activate account.",
      show: trialStatus === "expired" || session?.user.status === "suspended",
    },
  ].filter((plan) => plan.show);
  */

  const plans = [
    {
      type: "trial",
      name: "60-Day Trial",
      price: "Free",
      description:
        "No charge with 1 IUL sale every 2 months. Auto-cancels otherwise.",
      show: trialStatus === "none", // Only show for non-trial users
    },
    {
      type: "monthly",
      name: "Monthly",
      price: "$89/month",
      description: "Flexible billing with 60-day trial",
      show: true, // Always show
    },
    {
      type: "annual",
      name: "Annual",
      price: "$800/year",
      description: "Best value with 60-day trial",
      show: true, // Always show
    },
    // {
    //   type: "test",
    //   name: "Test Plan",
    //   price: "$1/month",
    //   description: "This is a test plan for testing purposes.",
    //   show: true, // Always show
    // },
    {
      type: "contact-admin",
      name: "Connect with Admin",
      price: "Free",
      description: "Confirm IUL sale to extend trial or activate account.",
      show: trialStatus === "expired" || session?.user.status === "suspended", // Explicitly show for expired or suspended
    },
  ].filter((plan) => plan.show);

  const handleSubscribe = async (plan: string) => {
    if (status !== "authenticated") {
      toast.error("Please log in to subscribe.");
      router.push("/");
      return;
    }

    setIsLoading(plan);
    try {
      if (plan === "contact-admin") {
        setShowContactDialog(true); // Open dialog instead of prompt
      } else {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Subscription failed");

        if (data.redirect) {
          toast.success(
            plan === "trial"
              ? "Trial activated! Complete 1 IUL sale every 2 months."
              : `Plan selected: ${plan}`
          );
          router.push(data.redirect);
        } else if (data.url) {
          router.push(data.url);
        } else {
          throw new Error("No checkout URL or redirect");
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      const message =
        error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleContactAdmin = async () => {
    if (!message) {
      toast.error("Message required");
      return;
    }

    setIsLoading("contact-admin");
    try {
      const response = await fetch("/api/contact-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message");

      toast.success("Message sent to admin!");
      router.push("/dashboard/home");
    } catch (error) {
      console.error("Contact admin error:", error);
      const message =
        error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
    } finally {
      setIsLoading(null);
      setShowContactDialog(false);
      setMessage("");
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
                    {plan.type === "contact-admin" ? (
                      <Mail className="h-5 w-5 text-primary" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-primary" />
                    )}
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
                    disabled={!!isLoading}
                  >
                    {isLoading === plan.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {plan.type === "trial"
                          ? "Start Trial"
                          : plan.type === "contact-admin"
                          ? "Contact Admin"
                          : "Select Plan"}
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Admin</DialogTitle>
          </DialogHeader>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message to confirm IUL sale"
            className="w-full"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowContactDialog(false);
                setMessage("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleContactAdmin} disabled={!!isLoading}>
              {isLoading === "contact-admin" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
