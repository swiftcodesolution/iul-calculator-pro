"use client";
export const dynamic = "force-dynamic";

import DownloadContentPageInner from "@/components/inners/DownloadsContentInner";
import { Suspense } from "react";

export default function DownloadContentPage() {
  return (
    <Suspense fallback={<div>Loading download content...</div>}>
      <DownloadContentPageInner />
    </Suspense>
  );
}
