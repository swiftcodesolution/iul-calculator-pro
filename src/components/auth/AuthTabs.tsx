import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";

const AuthTabs = () => {
  return (
    <Tabs defaultValue="signup" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="signup" asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Sign Up
          </motion.button>
        </TabsTrigger>
        <TabsTrigger value="login" asChild>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Login
          </motion.button>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="signup">
        <AnimatePresence mode="wait">
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create your account
            </h2>
            <SignupForm />
          </motion.div>
        </AnimatePresence>
      </TabsContent>
      <TabsContent value="login">
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Login</h2>
            <LoginForm />
          </motion.div>
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
