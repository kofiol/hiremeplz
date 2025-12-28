"use client";

import { Separator } from "@/components/ui/separator";
import { SectionCards } from "@/components/section-cards";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Analytics</h1>
      <Separator />
      <SectionCards />
    </div>
  );
}

