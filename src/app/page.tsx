"use client";

import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthTabs from "@/components/auth/AuthTabs";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard/home");
    }
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
      >
        <AuthHeader />
        <AuthTabs />
        <AuthFooter />
      </motion.div>
    </div>
  );
};

export default AuthPage;
