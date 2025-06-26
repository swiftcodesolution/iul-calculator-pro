"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AnimatedInput from "./AnimatedInput";
import Link from "next/link";

const requestResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type RequestResetData = z.infer<typeof requestResetSchema>;

const RequestResetForm = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: RequestResetData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Something went wrong");

      setMessage("Reset link sent. Please check your email.");
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(err.message || "Failed to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AnimatedInput hasError={!!form.formState.errors.email}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
          </AnimatedInput>

          {message && (
            <p className="text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}

          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            animate={
              isSubmitting
                ? {
                    scale: [1, 1.02, 1],
                    transition: { duration: 0.5, repeat: Infinity },
                  }
                : {}
            }
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-label="Send password reset link"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </motion.div>
        </form>
      </Form>
      <Link className="mt-4 text-center mx-auto block" href="/">
        Go Back
      </Link>
    </>
  );
};

export default RequestResetForm;
