"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function EarningsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Earnings</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg border border-dashed"></div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly total</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upwork</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
      </div>
    </div>
  );
}

