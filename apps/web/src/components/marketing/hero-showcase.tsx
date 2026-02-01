"use client"

import { cn } from "@/lib/utils"
import {
  Zap,
  Users,
  FileText,
  Mic,
  CheckCircle2,
  ArrowUpRight,
  Star,
} from "lucide-react"

function Pulse({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  )
}

export function HeroShowcase() {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
      {/* Proposal Writer Card - spans full width */}
      <div className="col-span-2 bg-card border border-border rounded-xl p-5 space-y-3 hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Proposal Writer</span>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Just now
          </span>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Analyzed job posting &mdash; matched 8/10 requirements
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generated custom proposal with portfolio highlights
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Pulse className="mt-1 flex-shrink-0" />
            <p className="text-xs text-foreground leading-relaxed font-medium">
              Optimizing tone for enterprise client...
            </p>
          </div>
        </div>
      </div>

      {/* Interview Prep Card */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Mic className="h-4 w-4 text-orange-500" />
          </div>
          <span className="text-sm font-medium">Interview Prep</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sessions</span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avg Score</span>
            <span className="font-medium text-primary">8.4/10</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <Pulse />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* CV Builder Card */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium">CV Builder</span>
        </div>
        <div className="space-y-2">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[85%] rounded-full bg-blue-500/60" />
          </div>
          <p className="text-xs text-muted-foreground">
            Profile strength: <span className="text-foreground font-medium">85%</span>
          </p>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">React</span>
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Node.js</span>
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">+6</span>
          </div>
        </div>
      </div>

      {/* Stats Bar - spans full width */}
      <div className="col-span-2 bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Profile Analysis</p>
            <p className="text-xs text-muted-foreground">
              3 improvements suggested
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          View
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}
