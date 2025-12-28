"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function FeedbackPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Feedback</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Extracted feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="outline">action_required</Badge>
            <Badge variant="outline">resolved</Badge>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">pricing</Badge>
            <Badge variant="secondary">communication</Badge>
            <Badge variant="secondary">skills</Badge>
            <Badge variant="secondary">timeline</Badge>
          </div>
          <div className="text-sm text-muted-foreground">Empty list</div>
        </CardContent>
      </Card>
    </div>
  );
}

