"use client";

import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setMessage(data.message);
      setTimeout(() => router.push("/auth"), 2000);
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
        >
          <Card className="w-md p-6">
            <h2 className="text-xl font-semibold text-center mb-4">
              Reset Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
            <p className="text-center text-sm mt-4">
              <Link href="/auth" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </Suspense>
  );
};

export default ResetPasswordPage;
