/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAuthForm.ts
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/types";
import { getSession, signIn } from "next-auth/react";

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async <
    T extends z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  >(
    data: T,
    type: "signup" | "login",
    form: UseFormReturn<T>
  ) => {
    setIsSubmitting(true);

    try {
      if (type === "signup") {
        const signupData = data as z.infer<typeof signupSchema>;

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupData.email.toLowerCase(),
            password: signupData.password,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            cellPhone: signupData.cellPhone,
            officePhone: signupData.officePhone,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `Signup failed with status ${response.status}`
          );
        }

        toast.success("Signup successful! Logging in...");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const loginResult = await signIn("credentials", {
          redirect: false,
          email: signupData.email.toLowerCase(),
          password: signupData.password,
          loginPath: pathname,
        });

        console.log("signIn Result:", loginResult);

        if (loginResult?.ok) {
          const session = await getSession();
          console.log("Session after signIn:", session);

          const userRole = session?.user?.role;
          const subscriptionStatus = session?.user?.subscriptionStatus;
          const isAdminPage = pathname === "/admin";

          if (isAdminPage && userRole !== "admin") {
            throw new Error("Only admin accounts can log in here");
          }

          if (!isAdminPage && userRole === "admin") {
            throw new Error(
              "Admin accounts can only be logged in from admin login page"
            );
          }

          // Redirect based on role and subscription status
          const redirectPath =
            userRole === "admin"
              ? "/admin/dashboard"
              : subscriptionStatus === "active" ||
                subscriptionStatus === "trialing"
              ? "/dashboard/home"
              : "/dashboard/subscribe";

          toast.success("Login successful");
          router.push(redirectPath);
        } else {
          throw new Error(loginResult?.error || "Auto-login failed");
        }
      } else {
        const loginData = data as z.infer<typeof loginSchema>;
        const loginEmail = loginData.loginEmail.toLowerCase();

        const result = await signIn("credentials", {
          redirect: false,
          email: loginEmail,
          password: loginData.loginPassword,
          loginPath: pathname,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        const session = await getSession();
        const userRole = session?.user?.role;
        const subscriptionStatus = session?.user?.subscriptionStatus;
        const isAdminPage = pathname === "/admin";

        if (isAdminPage && userRole !== "admin") {
          throw new Error("Only admin accounts can log in here");
        }

        if (!isAdminPage && userRole === "admin") {
          throw new Error(
            "Admin accounts can only be logged in from admin login page"
          );
        }

        const redirectPath =
          userRole === "admin"
            ? "/admin/dashboard"
            : subscriptionStatus === "active" ||
              subscriptionStatus === "trialing"
            ? "/dashboard/home"
            : "/dashboard/subscribe";

        toast.success("Login successful");
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error(`${type} error:`, error);

      let message = "Authentication failed. Please try again.";

      if (error.message.includes("Email already exists")) {
        message = "This email is already registered. Please log in instead.";
      } else if (error.message.includes("Cell phone")) {
        message =
          "This cell phone number is already associated with another account.";
      } else if (error.message.includes("Office phone")) {
        message =
          "This office phone number is already associated with another account.";
      } else if (error.message.includes("Invalid")) {
        message = "Invalid email or password. Please check and try again.";
      } else if (error.message.includes("device")) {
        message = "This device is not authorized to access your account.";
      } else if (
        error.message.includes("Only admin accounts can log in here")
      ) {
        message = "Only admin accounts can log in on this page.";
      } else if (
        error.message.includes(
          "Admin accounts can only be logged in from admin login page"
        )
      ) {
        message = "Admin accounts must log in from the admin login page.";
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  return { isSubmitting, handleSubmit };
}
