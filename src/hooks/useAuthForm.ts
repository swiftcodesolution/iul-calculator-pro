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
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setDeviceFingerprint(result.visitorId);
      } catch (error) {
        console.error("FingerprintJS error:", error);
        toast.error("Failed to initialize device fingerprint");
      }
    };
    initializeFingerprint();
  }, []);

  const generateFingerprint = async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const newFingerprint = result.visitorId;
      setDeviceFingerprint(newFingerprint);
      return newFingerprint;
    } catch (error) {
      console.error("FingerprintJS error:", error);
      toast.error("Failed to generate device fingerprint");
      return "";
    }
  };

  const handleSubmit = async <
    T extends z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  >(
    data: T,
    type: "signup" | "login",
    form: UseFormReturn<T>
  ) => {
    let currentFingerprint = deviceFingerprint;

    // Check if deviceFingerprint is null, undefined, or empty string
    if (!currentFingerprint || currentFingerprint === "") {
      currentFingerprint = await generateFingerprint();
      console.log("Generated fingerprint:", currentFingerprint); // Debug
      if (!currentFingerprint) {
        toast.error("Failed to generate device fingerprint. Try again.");
        return;
      }
      setDeviceFingerprint(currentFingerprint);
    }

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
            deviceFingerprint: currentFingerprint,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          if (result.error === "Email already exists") {
            toast.error("Email already exists");
          } else if (result.error === "Cell phone number already exists") {
            toast.error("Cell phone number already exists");
          } else if (result.error === "Office phone number already exists") {
            toast.error("Office phone number already exists");
          } else {
            throw new Error(result.error || "Signup failed");
          }
          return;
        }

        toast.success("Signup successful! Logging in...");

        const loginResult = await signIn("credentials", {
          redirect: false,
          email: signupData.email.toLowerCase(),
          password: signupData.password,
          deviceFingerprint: currentFingerprint,
        });

        if (loginResult?.ok) {
          toast.success("Login successful");
          router.push("/dashboard/home");
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
          deviceFingerprint: currentFingerprint,
        });

        if (result?.error) {
          if (
            result.error === "Login restricted to the device used for signup."
          ) {
            toast.error(
              "This device is not authorized. Use the device you signed up with."
            );
          } else {
            toast.error("Invalid email or password");
          }
        } else {
          toast.success("Login successful");
          router.push("/dashboard/home");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`${type} error:`, error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
      if (type === "signup") {
        form.reset();
      }
    }
  };

  return { isSubmitting, deviceFingerprint, handleSubmit };
}
