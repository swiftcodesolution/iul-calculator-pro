"use client";

import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthTabs from "@/components/auth/AuthTabs";
import { motion } from "motion/react";

const AuthPage = () => {
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
