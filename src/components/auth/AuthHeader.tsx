import { motion } from "motion/react";
import Image from "next/image";

const AuthHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="text-center mb-6"
    >
      <Image
        width={300}
        height={100}
        src="/logo.png"
        alt="IUL Calculator Pro Logo"
        className="h-16 w-full mx-auto mb-2 object-contain"
      />
    </motion.header>
  );
};

export default AuthHeader;
