"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import RequestResetForm from "@/components/auth/RequestResetForm";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";

const ResetPasswordRequestPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
      >
        <Card className="w-md p-6 max-w-md">
          <AuthHeader />

          <div className="my-6">
            <RequestResetForm />
          </div>

          <AuthFooter />
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordRequestPage;
