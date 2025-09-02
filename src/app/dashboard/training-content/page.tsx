"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import TrainingContentPageInner from "@/components/inners/TrainingContentInner";

export default function TrainingContentPage() {
  return (
    <Suspense fallback={<div>Loading training content...</div>}>
      <TrainingContentPageInner />
    </Suspense>
  );
}
