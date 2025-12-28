"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Settings</h1>
      <Separator />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile completeness</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agent settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Job search, ranking tightness, cover letter style</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Mailgun routing instructions</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chrome extension pairing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Empty</CardContent>
        </Card>
      </div>
    </div>
  );
}

