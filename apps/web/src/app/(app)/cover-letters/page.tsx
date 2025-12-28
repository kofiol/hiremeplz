"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function CoverLettersPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Cover Letters</h1>
      <Separator />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Job A</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Empty list</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Copy</Button>
              <Button variant="outline" size="sm">Open apply link</Button>
              <Button size="sm">Send to extension</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job B</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Empty list</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Copy</Button>
              <Button variant="outline" size="sm">Open apply link</Button>
              <Button size="sm">Send to extension</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

