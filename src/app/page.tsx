// src/app/page.tsx
"use client";

import * as motion from "motion/react-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

// Validation schemas
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  loginEmail: z.string().email("Invalid email address"),
  loginPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthPage() {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign-Up form
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginEmail: "",
      loginPassword: "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof signupSchema> | z.infer<typeof loginSchema>,
    type: "signup" | "login"
  ) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      type === "signup"
        ? "Client user code sent to your email."
        : "Successfully logged in.",
      {
        description: `Welcome${
          type === "signup"
            ? `, ${(data as z.infer<typeof signupSchema>).firstName}`
            : ""
        }!`,
        duration: 3000,
        style: {
          background: "white",
          color: "#1F2A44",
          border: "1px solid #E5E7EB",
        },
      }
    );
    setIsSubmitting(false);
    if (type === "signup") {
      signupForm.reset();
    } else {
      loginForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <header className="text-center mb-6">
          <Image
            width={100}
            height={100}
            src="/placeholder-logo.png"
            alt="IUL Calculator Pro Logo"
            className="h-16 w-16 mx-auto mb-2 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900">
            IUL Calculator Pro
          </h1>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          {/* Sign-Up Tab */}
          <TabsContent value="signup">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create Your Account
              </h2>
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit((data) =>
                    handleSubmit(data, "signup")
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="firstName">First Name</Label>
                        <FormControl>
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="mt-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="lastName">Last Name</Label>
                        <FormControl>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="mt-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="mt-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="password">Password</Label>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="mt-1 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() =>
                                setShowSignupPassword(!showSignupPassword)
                              }
                              aria-label={
                                showSignupPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showSignupPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={isSubmitting}
                    aria-label="Sign up for IUL Calculator Pro"
                  >
                    {isSubmitting ? "Submitting..." : "Sign Up"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </TabsContent>

          {/* Login Tab */}
          <TabsContent value="login">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Log In</h2>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    handleSubmit(data, "login")
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="loginEmail"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="loginEmail">Email</Label>
                        <FormControl>
                          <Input
                            id="loginEmail"
                            type="email"
                            placeholder="john@example.com"
                            className="mt-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="loginPassword"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="loginPassword">Password</Label>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="loginPassword"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="mt-1 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() =>
                                setShowLoginPassword(!showLoginPassword)
                              }
                              aria-label={
                                showLoginPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={isSubmitting}
                    aria-label="Log in to IUL Calculator Pro"
                  >
                    {isSubmitting ? "Submitting..." : "Login"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-600">
          <p>Steven Johnson, 760-846-0436</p>
        </footer>
      </motion.div>
    </div>
  );
}
