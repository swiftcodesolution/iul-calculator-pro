import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

type PasswordToggleProps = {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
};

const PasswordToggle = ({
  showPassword,
  setShowPassword,
}: PasswordToggleProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      className="absolute right-2 top-1/2 -translate-y-1/2"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </motion.button>
  );
};

export default PasswordToggle;
