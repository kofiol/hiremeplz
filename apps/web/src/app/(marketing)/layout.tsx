"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "../auth/session-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

type MarketingLayoutProps = {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, isLoading } = useSession()
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(true)
  const isAnnouncementVisible = pathname === "/" && isAnnouncementOpen

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/overview")
    }
  }, [isLoading, session, router])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {isAnnouncementVisible ? (
        <div className="fixed inset-x-0 top-0 z-[60] h-9 bg-primary text-primary-foreground">
          <div className="container mx-auto flex h-9 items-center justify-between px-4 md:px-6">
            <Link
              href="https://bags.fm/EDYaRCTnzdVKqaVKrfTZQ6nvoXtwQaMihf1yNTRkBAGS"
              className="truncate text-sm hover:opacity-80 transition-opacity"
            >
              Support this project on{" "}
              <span className="font-medium underline underline-offset-2">
                BAGS.FM
              </span>
            </Link>
            <button
              type="button"
              aria-label="Close announcement"
              onClick={() => setIsAnnouncementOpen(false)}
              className="ml-3 inline-flex h-7 w-7 flex-none items-center justify-center rounded hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <header
        className={cn(
          "fixed inset-x-0 z-50 transition-[top] duration-200",
          isAnnouncementVisible ? "top-9" : "top-0"
        )}
      >
        <div className="container mx-auto px-4 pt-4 md:px-6">
          <div className="flex h-14 items-center justify-between rounded-lg border border-border bg-background/95 backdrop-blur-sm px-4 md:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded bg-foreground" />
              <span className="text-base font-medium">HireMePlz</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How it works
              </Link>
              <Link
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Access
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-lg"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="font-medium">HireMePlz</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-4 mt-4">
                    <SheetClose asChild>
                      <Link
                        href="#how-it-works"
                        className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                      >
                        How it works
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="#features"
                        className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                      >
                        Features
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                      >
                        Access
                      </Link>
                    </SheetClose>
                  </div>
                  <div className="mt-auto flex flex-col gap-2 p-4">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className={cn(
                          buttonVariants({
                            className: "w-full rounded-full",
                          })
                        )}
                      >
                        Log in
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
        

              <Button size="sm" className="rounded-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 z-10">{children}</main>

<footer className="relative border-t border-border bg-muted/30 z-10">
  <div className="container mx-auto px-4 md:px-6 py-16">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="space-y-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-foreground" />
          <span className="font-medium">HireMePlz</span>
        </Link>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your personal AI agent for navigating the freelance chaos. Stop
          searching, start earning.
        </p>
        <div className="flex gap-4 pt-2">
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="currentColor"
            >
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-lg">Landing</h3>
        <ul className="space-y-3 text-sm text-muted-foreground mb-8">
          <li>
            <Link
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
          </li>
          <li>
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Access
            </Link>
          </li>
        </ul>

        <h3 className="font-medium mb-4 text-lg">Company</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <Link
              href="https://x.com/ai_dev_at_14"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-lg">Product</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <Link
              href="/overview"
              className="hover:text-foreground transition-colors"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="hover:text-foreground transition-colors"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              href="/interview-prep"
              className="hover:text-foreground transition-colors"
            >
              Interview Prep
            </Link>
          </li>
          <li>
            <Link
              href="/cv-builder"
              className="hover:text-foreground transition-colors"
            >
              CV Builder
            </Link>
          </li>
          <li>
            <Link
              href="/proposal-writer"
              className="hover:text-foreground transition-colors"
            >
              Proposal Writer
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className="hover:text-foreground transition-colors"
            >
              Feedback
            </Link>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} HireMePlz/hiremeplz.app - All rights
        reserved.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
        <span>Systems Operational</span>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}
