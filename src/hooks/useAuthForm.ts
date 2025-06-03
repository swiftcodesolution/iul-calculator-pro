import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/types";
import { signIn } from "next-auth/react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const initializeFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };
    initializeFingerprint();
  }, []);

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
            deviceFingerprint,
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
          deviceFingerprint,
        });

        if (loginResult?.ok) {
          router.push("/dashboard/home");
        } else {
          toast.error("Signup succeeded, but auto-login failed.");
        }
      } else {
        const loginData = data as z.infer<typeof loginSchema>;
        const result = await signIn("credentials", {
          redirect: false,
          email: loginData.loginEmail,
          password: loginData.loginPassword,
          deviceFingerprint,
        });
        if (result?.error) {
          toast.error(
            result.error === "Login restricted to the device used for signup."
              ? "This device is not authorized. Use the device you signed up with."
              : "Invalid credentials"
          );
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
  };

  return { isSubmitting, handleSubmit };
}
