"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trainingResources = [
  { title: "View the Training Page", link: "/dashboard/training-content" },
  { title: "Downloads", link: "/dashboard/downloads-content" },
];

export default function TrainingResourcesSection() {
  return (
    <Card className="flex-1 p-2">
      <CardContent className="p-0 space-y-2 h-full">
        <h3 className="font-bold text-sm">Training</h3>
        {trainingResources.map((resource) => (
          <motion.div
            key={resource.link}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => window.open(resource.link, "_blank")}
              className="w-full"
              variant="default"
              size="sm"
            >
              {resource.title}
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
