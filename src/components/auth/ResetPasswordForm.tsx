"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation"; // Add useRouter
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AnimatedInput from "./AnimatedInput";
import PasswordToggle from "./PasswordToggle";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/types";

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useParams();
  const router = useRouter(); // Initialize router

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Missing token");
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: data.newPassword }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Reset failed");

      toast.success("Password reset successfully!");
      form.reset();
      router.push("/"); // Redirect to /app/page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label="Reset password form"
      >
        <AnimatedInput hasError={!!form.formState.errors.newPassword}>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...form.register("newPassword")}
            />
            <PasswordToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </AnimatedInput>

        <AnimatedInput hasError={!!form.formState.errors.confirmPassword}>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...form.register("confirmPassword")}
          />
        </AnimatedInput>

        <motion.div
          whileHover={{
            scale: 1.05,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
