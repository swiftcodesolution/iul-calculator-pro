import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedInput from "./AnimatedInput";
import PasswordToggle from "./PasswordToggle";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useState } from "react";
import { loginSchema } from "@/lib/types";
import { z } from "zod";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isSubmitting, handleSubmit } = useAuthForm();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginEmail: "", loginPassword: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          handleSubmit(data, "login", form)
        )}
        className="space-y-4"
      >
        <AnimatedInput hasError={!!form.formState.errors.loginEmail}>
          <Label htmlFor="loginEmail">Email</Label>
          <Input
            id="loginEmail"
            type="email"
            placeholder="john@example.com"
            {...form.register("loginEmail")}
          />
        </AnimatedInput>
        <AnimatedInput hasError={!!form.formState.errors.loginPassword}>
          <Label htmlFor="loginPassword">Password</Label>
          <div className="relative">
            <Input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...form.register("loginPassword")}
            />
            <PasswordToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </AnimatedInput>
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
            aria-label="Log in to IUL Calculator Pro"
          >
            {isSubmitting ? "Submitting..." : "Login"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default LoginForm;
