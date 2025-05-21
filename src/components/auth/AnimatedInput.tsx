import { motion } from "motion/react";
import { FormControl, FormItem } from "../ui/form";

type AnimatedInputProps = {
  children: React.ReactNode;
  hasError: boolean;
};

const AnimatedInput = ({ children, hasError }: AnimatedInputProps) => {
  return (
    <FormItem>
      <FormControl>
        <motion.div
          whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
          animate={
            hasError
              ? { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3 } }
              : {}
          }
        >
          {children}
        </motion.div>
      </FormControl>
    </FormItem>
  );
};

export default AnimatedInput;
