// src/app/page.tsx
"use client";

import * as motion from "motion/react-client";
import { AnimatePresence } from "framer-motion";
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
import { useRouter } from "next/navigation";

// Validation schemas (unchanged)
const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Passwords must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  loginEmail: z.string().email("Invalid email address"),
  loginPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthPage() {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Sign-Up form (unchanged)
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Login form (unchanged)
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
    router.push("/dashboard/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <header className="text-center mb-6">
          <Image
            width={300}
            height={100}
            src="/logo.png"
            alt="IUL Calculator Pro Logo"
            className="h-16 w-full mx-auto mb-2 object-contain"
          />
        </header>

        {/* Tabs */}
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signup" asChild>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#f5f6f5" }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  type: "tween",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.3,
                }}
              >
                Sign Up
              </motion.button>
            </TabsTrigger>
            <TabsTrigger value="login" asChild>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#f5f6f5" }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  type: "tween",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.3,
                }}
              >
                Login
              </motion.button>
            </TabsTrigger>
          </TabsList>

          {/* Sign-Up Tab */}
          <TabsContent value="signup">
            <AnimatePresence mode="wait">
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
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
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="firstName">First Name</Label>
                          <FormControl>
                            <motion.div
                              animate={
                                fieldState.error ? { x: [-2, 2, -2, 2, 0] } : {}
                              }
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="firstName"
                                placeholder="John"
                                className="mt-1"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="lastName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="lastName">Last Name</Label>
                          <FormControl>
                            <motion.div
                              animate={
                                fieldState.error ? { x: [-2, 2, -2, 2, 0] } : {}
                              }
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="lastName"
                                placeholder="Doe"
                                className="mt-1"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="email">Email</Label>
                          <FormControl>
                            <motion.div
                              animate={
                                fieldState.error ? { x: [-2, 2, -2, 2, 0] } : {}
                              }
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                className="mt-1"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="password">Password</Label>
                          <FormControl>
                            <div className="relative">
                              <motion.div
                                animate={
                                  fieldState.error
                                    ? { x: [-2, 2, -2, 2, 0] }
                                    : {}
                                }
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  id="password"
                                  type={
                                    showSignupPassword ? "text" : "password"
                                  }
                                  placeholder="••••••••"
                                  className="mt-1 pr-10"
                                  {...field}
                                />
                              </motion.div>
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
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <FormControl>
                            <div className="relative">
                              <motion.div
                                animate={
                                  fieldState.error
                                    ? { x: [-2, 2, -2, 2, 0] }
                                    : {}
                                }
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  id="confirmPassword"
                                  type={
                                    showSignupPassword ? "text" : "password"
                                  }
                                  placeholder="••••••••"
                                  className="mt-1 pr-10"
                                  {...field}
                                />
                              </motion.div>
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
                    <motion.div
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      animate={isSubmitting ? { opacity: [1, 0.8, 1] } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        duration: isSubmitting ? 0.5 : 0.2,
                      }}
                    >
                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isSubmitting}
                        aria-label="Sign up for IUL Calculator Pro"
                      >
                        {isSubmitting ? "Submitting..." : "Sign Up"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Login Tab */}
          <TabsContent value="login">
            <AnimatePresence mode="wait">
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
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
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="loginEmail">Email</Label>
                          <FormControl>
                            <motion.div
                              animate={
                                fieldState.error ? { x: [-2, 2, -2, 2, 0] } : {}
                              }
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="loginEmail"
                                type="email"
                                placeholder="john@example.com"
                                className="mt-1"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="loginPassword"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <Label htmlFor="loginPassword">Password</Label>
                          <FormControl>
                            <div className="relative">
                              <motion.div
                                animate={
                                  fieldState.error
                                    ? { x: [-2, 2, -2, 2, 0] }
                                    : {}
                                }
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  id="loginPassword"
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="mt-1 pr-10"
                                  {...field}
                                />
                              </motion.div>
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
                    <motion.div
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      animate={isSubmitting ? { opacity: [1, 0.8, 1] } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        duration: isSubmitting ? 0.5 : 0.2,
                      }}
                    >
                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isSubmitting}
                        aria-label="Log in to IUL Calculator Pro"
                      >
                        {isSubmitting ? "Submitting..." : "Login"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-600">
          <p>Copyright © {new Date().getFullYear()} - IUL Calculator Pro</p>
        </footer>
      </motion.div>
    </div>
  );
}
