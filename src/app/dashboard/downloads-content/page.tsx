"use client";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { Suspense } from "react";
import DownloadContentPageInner from "@/components/inners/DownloadsContentInner";

export default function DownloadContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadContentPageInner />
    </Suspense>
  );
}
