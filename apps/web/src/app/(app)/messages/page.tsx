"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Messages</h1>
      <Separator />
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Thread A</CardTitle>
            <Badge variant="outline">Upwork</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Empty thread</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Needs reply</Button>
              <Button variant="outline" size="sm">Create feedback</Button>
              <Button size="sm">Link to application</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Thread B</CardTitle>
            <Badge variant="outline">Email</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Empty thread</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Needs reply</Button>
              <Button variant="outline" size="sm">Create feedback</Button>
              <Button size="sm">Link to application</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

