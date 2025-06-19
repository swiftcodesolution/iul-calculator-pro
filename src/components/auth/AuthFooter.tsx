import { motion } from "motion/react";

const AuthFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mt-6 text-center text-sm"
    >
      <p>Copyright © {new Date().getFullYear()} - IUL Calculator Pro</p>
    </motion.footer>
  );
};

export default AuthFooter;
