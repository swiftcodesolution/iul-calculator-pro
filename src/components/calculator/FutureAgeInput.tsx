import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="">
            <Label className="text-sm text-center mb-4">Future Age</Label>
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
                />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
