import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FutureAgeInputProps {
  futureAge: number;
  onFutureAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FutureAgeInput({
  futureAge,
  onFutureAgeChange,
}: FutureAgeInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <div className="text-black">
        <div>
          <div className="flex items-center justify-start gap-2">
            <Label className="text-sm">Future Age</Label>
            <div className="flex flex-col gap-2">
              <motion.div
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 0 2px #3b82f6",
                }}
              >
                <Input
                  placeholder="Age"
                  type="number"
                  value={futureAge}
                  onChange={onFutureAgeChange}
                  className="w-20"
                  min={0}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
