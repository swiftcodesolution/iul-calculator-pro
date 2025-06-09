"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthForm } from "@/hooks/useAuthForm";
import { loginSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminAuthPage() {
  const { isSubmitting, handleSubmit } = useAuthForm();
  const {
    register,
    handleSubmit: formSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSubmit(data, "login", { reset: () => {} } as any);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="loginEmail">Email</Label>
            <Input
              id="loginEmail"
              type="email"
              {...register("loginEmail")}
              className={errors.loginEmail ? "border-red-500" : ""}
            />
            {errors.loginEmail && (
              <p className="text-sm text-red-500">
                {errors.loginEmail.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="loginPassword">Password</Label>
            <Input
              id="loginPassword"
              type="password"
              {...register("loginPassword")}
              className={errors.loginPassword ? "border-red-500" : ""}
            />
            {errors.loginPassword && (
              <p className="text-sm text-red-500">
                {errors.loginPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
