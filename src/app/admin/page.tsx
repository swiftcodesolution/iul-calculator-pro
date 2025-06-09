"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";

export default function AdminAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(
        session.user.role === "admin" ? "/admin/dashboard" : "/dashboard/home"
      );
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AuthHeader />
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <AuthFooter />
        </CardContent>
      </Card>
    </div>
  );
}
