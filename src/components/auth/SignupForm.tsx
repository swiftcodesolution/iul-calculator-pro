import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import AnimatedInput from "./AnimatedInput";
import PasswordToggle from "./PasswordToggle";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useState } from "react";
import { signupSchema } from "@/lib/types";
import { z } from "zod";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isSubmitting, handleSubmit } = useAuthForm();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      cellPhone: "",
      officePhone: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          handleSubmit(data, "signup", form)
        )}
        className="space-y-4"
      >
        <div className="flex gap-2">
          <AnimatedInput hasError={!!form.formState.errors.firstName}>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...form.register("firstName")}
            />
          </AnimatedInput>
          <AnimatedInput hasError={!!form.formState.errors.lastName}>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...form.register("lastName")}
            />
          </AnimatedInput>
        </div>
        <AnimatedInput hasError={!!form.formState.errors.email}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...form.register("email")}
          />
        </AnimatedInput>
        <div className="flex gap-2">
          <AnimatedInput hasError={!!form.formState.errors.cellPhone}>
            <Label htmlFor="cellPhone">Cell Phone</Label>
            <Input
              id="cellPhone"
              type="tel"
              placeholder="123-456-7890"
              {...form.register("cellPhone")}
            />
          </AnimatedInput>
          <AnimatedInput hasError={!!form.formState.errors.officePhone}>
            <Label htmlFor="officePhone">Office Phone</Label>
            <Input
              id="officePhone"
              type="tel"
              placeholder="123-456-7890"
              {...form.register("officePhone")}
            />
          </AnimatedInput>
        </div>
        <AnimatedInput hasError={!!form.formState.errors.password}>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...form.register("password")}
            />
            <PasswordToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </AnimatedInput>
        <AnimatedInput hasError={!!form.formState.errors.confirmPassword}>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...form.register("confirmPassword")}
            />
            <PasswordToggle
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Sign Up"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default SignupForm;
