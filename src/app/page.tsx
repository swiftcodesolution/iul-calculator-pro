"use client";

import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthTabs from "@/components/auth/AuthTabs";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "admin") {
      router.push("admin/dashboard/");
    } else if (status === "authenticated" && session.user.role === "agent") {
      router.push("/dashboard/home");
    }
  }, [session, status, router]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
      >
        <Card className="w-md p-6">
          <AuthHeader />
          <AuthTabs />
          <AuthFooter />
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
