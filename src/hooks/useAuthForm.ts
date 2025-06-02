import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/types";
import { signIn } from "next-auth/react";

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

    try {
      if (type === "signup") {
        const signupData = data as z.infer<typeof signupSchema>;
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Signup failed");
        }

        toast.success("Signup successful!");

        const loginResult = await signIn("credentials", {
          redirect: false,
          email: signupData.email,
          password: signupData.password,
        });

        if (loginResult?.ok) {
          router.push("/dashboard/home"); // ✅ Redirect after successful login
        } else {
          toast.error("Signup succeeded, but auto-login failed.");
        }

        router.push(result.redirect || "/dashboard/home");
      } else {
        const loginData = data as z.infer<typeof loginSchema>;
        const result = await signIn("credentials", {
          redirect: false,
          email: loginData.loginEmail,
          password: loginData.loginPassword,
        });
        if (result?.error) {
          toast.error("invalid credentials");
        } else {
          toast.success("login successfull");
          router.push("/dashboard/home");
        }
      }
    } catch (error) {
      toast.error("error occured");
      console.log(error);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }

    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Replace with API call
    // toast.success(
    //   type === "signup"
    //     ? "Client user code sent to your email."
    //     : "Successfully logged in.",
    //   {
    //     description: `Welcome${
    //       type === "signup"
    //         ? `, ${(data as z.infer<typeof signupSchema>).firstName}`
    //         : ""
    //     }!`,
    //     duration: 3000,
    //     style: {
    //       background: "white",
    //       color: "#1F2A44",
    //       border: "1px solid #E5E7EB",
    //     },
    //     onAutoClose: () => form.reset(),
    //   }
    // );
    // setIsSubmitting(false);
    // router.push("/dashboard/home");
  };

  return { isSubmitting, handleSubmit };
}
