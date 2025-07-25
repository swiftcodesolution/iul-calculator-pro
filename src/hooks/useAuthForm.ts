// src/hooks/useAuthForm.ts
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/types";
import { getSession, signIn } from "next-auth/react";

// import FingerprintJS from "@fingerprintjs/fingerprintjs";

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  // const maxRetries = 100;

  /*
  useEffect(() => {
    let retries = 0;

    const initializeFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();

        while (retries < maxRetries) {
          try {
            const result = await fp.get();
            console.log("initial: ", result.visitorId);

            setDeviceFingerprint(result.visitorId);

            break;
          } catch (error) {
            retries++;

            console.error(`FingerprintJS attempt ${retries} failed:`, error);

            if (retries === maxRetries) {
              toast.error(
                "Failed to initialize device fingerprint after retries"
              );
            }
          }
        }
      } catch (err) {
        toast.error("FingerprintJS failed to load.");
        console.error("FingerprintJS load error:", err);
      }
    };

    initializeFingerprint();
  }, []);
  */

  /*
  const generateFingerprint = async () => {
    try {
      const fp = await FingerprintJS.load();

      let retries = 0;

      while (retries < maxRetries) {
        try {
          const result = await fp.get();
          console.log("generated: ", result.visitorId);

          const newFingerprint = result.visitorId;

          setDeviceFingerprint(newFingerprint);

          return newFingerprint;
        } catch (error) {
          retries++;

          console.error(`FingerprintJS attempt ${retries} failed:`, error);
          if (retries === maxRetries) {
            toast.error("Failed to generate device fingerprint after retries");
            return "";
          }
        }
      }
    } catch (err) {
      toast.error("FingerprintJS failed to load.");
      console.error("FingerprintJS load error:", err);
      return "";
    }

    return "";
  };
  */

  const handleSubmit = async <
    T extends z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  >(
    data: T,
    type: "signup" | "login",
    form: UseFormReturn<T>
  ) => {
    /*
    let currentFingerprint = deviceFingerprint;

    if (!currentFingerprint) {
      currentFingerprint = await generateFingerprint();
      if (!currentFingerprint) {
        toast.error("Cannot proceed without device fingerprint");
        return;
      }
    }
    */

    setIsSubmitting(true);

    try {
      if (type === "signup") {
        const signupData = data as z.infer<typeof signupSchema>;

        // console.log("signup fp: ", currentFingerprint);

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
            // deviceFingerprint: currentFingerprint,
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

        // console.log("login fp: ", currentFingerprint);

        const loginResult = await signIn("credentials", {
          redirect: false,

          email: signupData.email.toLowerCase(),
          password: signupData.password,
          // deviceFingerprint: currentFingerprint,
          loginPath: pathname,
        });

        console.log("signIn Result:", loginResult);

        if (loginResult?.ok) {
          const session = await getSession();

          console.log("Session after signIn:", session);

          const userRole = session?.user?.role;
          const isAdminPage = pathname === "/admin";

          if (isAdminPage && userRole !== "admin") {
            throw new Error("Only admin accounts can log in here");
          }

          if (!isAdminPage && userRole === "admin") {
            throw new Error(
              "Admin accounts can only be logged in from admin login page"
            );
          }

          // const redirectPath =
          //   userRole === "admin" ? "/admin/dashboard" : "/dashboard/home";

          toast.success("Login successful");

          // router.push(redirectPath);
          if (userRole !== "admin") {
            router.push("/dashboard/subscribe");
          } else {
            router.push("/admin/dashboard");
          }
        } else {
          throw new Error(loginResult?.error || "Auto-login failed");
        }
      } else {
        const loginData = data as z.infer<typeof loginSchema>;
        const loginEmail = loginData.loginEmail.toLowerCase();

        // console.log("Login fingerprint:", currentFingerprint);

        const result = await signIn("credentials", {
          redirect: false,

          email: loginEmail,
          password: loginData.loginPassword,
          // deviceFingerprint: currentFingerprint,
          loginPath: pathname,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        const session = await getSession();
        const userRole = session?.user?.role;
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
          userRole === "admin" ? "/admin/dashboard" : "/dashboard/home";

        toast.success("Login successful");

        router.push(redirectPath);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // return { isSubmitting, deviceFingerprint, handleSubmit };
  return { isSubmitting, handleSubmit };
}
