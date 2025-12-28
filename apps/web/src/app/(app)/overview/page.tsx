"use client";

import { useSession } from "../../auth/session-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OverviewPage() {
  const { session, isLoading } = useSession();

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Overview</h1>
        {!isLoading && session ? (
          <Badge variant="outline">Signed in</Badge>
        ) : (
          <Badge variant="outline">Loading</Badge>
        )}
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today’s actions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Generate cover letters (N), Apply to top jobs (N), Reply needed (N)
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline snapshot</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Empty state
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent agent runs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Empty state
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            New high-score job, daily limit reached, suspicious job detected
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
