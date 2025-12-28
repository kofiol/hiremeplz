"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Team</h1>
      <Separator />
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Leader</CardTitle>
          <Button size="sm">Invite member</Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Empty section
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Member</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Shared jobs + applications, personal cover letters
        </CardContent>
      </Card>
    </div>
  );
}

