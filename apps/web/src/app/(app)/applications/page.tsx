"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function ApplicationsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      <h1 className="text-lg font-medium">Applications</h1>
      <Separator />
      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Applied</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Empty column
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Interview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Empty column
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Offer/Won</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Empty column
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      No applications yet
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

