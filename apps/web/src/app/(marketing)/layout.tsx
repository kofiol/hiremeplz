"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname();
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(true);
  const isAnnouncementVisible = pathname === "/" && isAnnouncementOpen;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-purple-500/30">
      {isAnnouncementVisible ? (
        <div className="fixed inset-x-0 top-0 z-[60] h-9 bg-green-500 text-black">
          <div className="container mx-auto flex h-9 items-center justify-between px-4 md:px-6">
            <Link
              href="https://bags.fm/EDYaRCTnzdVKqaVKrfTZQ6nvoXtwQaMihf1yNTRkBAGS"
              className="truncate text-sm font-medium underline underline-offset-2 hover:opacity-90"
            >
              Support this project and it&apos;s founder by trading the official token on <span className="text-white">BAGS.FM</span> -{">"}
            </Link>
            <button
              type="button"
              aria-label="Close announcement"
              onClick={() => setIsAnnouncementOpen(false)}
              className="ml-3 inline-flex h-7 w-7 flex-none items-center justify-center rounded hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <header className={cn("fixed inset-x-0 z-50 transition-[top] duration-200", isAnnouncementVisible ? "top-9" : "top-0")}>
        <div className="container mx-auto px-4 pt-4 md:px-6">
          <div className="flex h-16 items-center justify-between rounded-2xl border border-border/60 bg-background/95 px-4 shadow-sm md:px-6">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-white to-white" />
              <span className="text-base font-bold tracking-tight">HireMePlz</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#waitlist" className="hover:text-foreground transition-colors">Waitlist</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>HireMePlz</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 px-4">
                    <SheetClose asChild>
                      <Link href="#how-it-works" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                        How it works
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="#features" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                        Features
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="#waitlist" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                        Waitlist
                      </Link>
                    </SheetClose>
                  </div>
                  <div className="mt-auto flex flex-col gap-2 p-4">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ variant: "outline", className: "w-full rounded-full" }))}
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="#waitlist"
                        className={cn(
                          buttonVariants({
                            className: "w-full rounded-full",
                          }),
                        )}
                      >
                        Get Access <Sparkles className="ml-1 h-3 w-3 text-purple-400" />
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
              <Link
                href="/login"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground px-4"
              >
                Log in
              </Link>

              <Button size="sm" className="rounded-full" asChild>
                <Link href="#waitlist">
                  Get Access <Sparkles className="ml-1 h-3 w-3 text-purple-400" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 z-10">
        {children}
      </main>

      <footer className="relative border-t bg-background z-10">
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-white to-white" />
                <span className="text-lg font-bold">HireMePlz</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Your personal AI agent for navigating the freelance chaos. Stop searching, start earning.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </Link>

              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="https://forms.gle/RYhbUrwwxhWn1dwS9" className="hover:text-primary transition-colors">Waitlist</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="https://x.com/ai_dev_at_14" className="hover:text-primary transition-colors">Blog</Link></li>

              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} HireMePlz/hiremeplz.app - All rights reserved.
            </p>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-xs border-green-500/30 bg-green-500/5 text-green-600">
                 <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Systems Operational :)
               </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
