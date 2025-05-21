import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/types";

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async <
    T extends z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  >(
    data: T,
    type: "signup" | "login",
    form: UseFormReturn<T>
  ) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Replace with API call
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
        onAutoClose: () => form.reset(),
      }
    );
    setIsSubmitting(false);
    router.push("/dashboard/home");
  };

  return { isSubmitting, handleSubmit };
}
