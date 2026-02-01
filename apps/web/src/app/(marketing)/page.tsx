"use client"

import type { ReactNode } from "react"
import { Fragment, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Clock,
  Briefcase,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe,
  Smile,
  Users,
  ArrowRight,
} from "lucide-react"

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReducedMotion(mediaQuery.matches)
    update()
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update)
      return () => mediaQuery.removeEventListener("change", update)
    }
    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  return prefersReducedMotion
}

type RevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
}

function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const isVisible = prefersReducedMotion || hasIntersected

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const element = ref.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasIntersected(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        prefersReducedMotion
          ? ""
          : "transform-gpu will-change-[opacity,transform] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
        className
      )}
    >
      {children}
    </div>
  )
}

import { HeroShowcase } from "@/components/marketing/hero-showcase"
import {
  MessageSquare,
  Lock,
  Layers,
  History,
  Laptop
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground overflow-x-hidden">
      {/* Hero Section - Clean, calm, editorial */}
      <section className="relative min-h-[85svh] flex items-center pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">

        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal className="space-y-8">
              <div>
                <Badge
                  variant="outline"
                  className="mb-6 px-3 py-1.5 border-border text-muted-foreground text-sm font-normal"
                >
                  Now live
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1] mb-6 text-balance">
                  Your{" "}
                  <span className="underline decoration-primary/40 decoration-2 underline-offset-4">
                    personal AI agent
                  </span>{" "}
                  for winning freelance work
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  HireMePlz helps you craft perfect proposals, master your interviews, and 
                  optimize your profile. The all-in-one AI toolkit for serious freelancers.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Zap className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-sans font-medium text-base">Smart Proposal Writer</h3>
                    <p className="text-muted-foreground text-sm">
                      Drafts that convert, tailored to your profile.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-sans font-medium text-base">AI Interview Prep</h3>
                    <p className="text-muted-foreground text-sm">
                      Practice real scenarios with an AI client.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-sans font-medium text-base">
                      Profile Optimization
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Stand out with polished CVs and profiles.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-full"
                  asChild
                >
                  <Link href="/login">
                    Get access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-base px-8 py-6 rounded-full text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="#features">Learn more</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delayMs={120} className="hidden lg:block">
              <HeroShowcase />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <Reveal className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-medium">
              The real problem with freelancing today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You know how to do your job — but spend hours{" "}
              <span className="text-foreground">not actually doing it</span>.
            </p>
          </Reveal>

          <Reveal delayMs={120} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium text-lg">Overcrowded Market</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The freelance market is saturated. Standing out is harder than ever.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium text-lg">Interview Nerves</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fumbling answers during discovery calls even when you know the technology inside out.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium text-lg">Undervalued Work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Getting passed over for premium rates because your profile doesn't communicate your true value.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={220} className="mt-12 text-center">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The hardest part isn&rsquo;t finding projects — it&rsquo;s
              building a{" "}
              <span className="text-foreground font-medium">
                systematic, predictable
              </span>{" "}
              workflow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <Reveal className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              The Outcome
            </Badge>
            <h2 className="text-3xl md:text-4xl font-medium">
              A pipeline that feels predictable
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop refreshing boards. Get a stream of opportunities that match
              your profile.
            </p>
          </Reveal>

          <Reveal delayMs={120} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium">Time Back</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hours of searching become minutes of decision-making.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium">Higher Quality Leads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Less spam, fewer mismatches, more opportunities you can win.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-sans font-medium">More Consistent Work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build a steady system instead of relying on luck.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={220} className="mt-14 text-center">
            <Button className="rounded-full px-8" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Onboarding takes ~15 minutes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-muted/30 scroll-mt-28">
        <div className="container px-4 md:px-6 mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              Onboarding takes just 15 minutes. Then the AI gets to work.
            </p>
          </Reveal>

          <Reveal delayMs={120} className="max-w-6xl mx-auto mb-16">
            <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-y-6 items-start">
              {[
                {
                  num: "1",
                  title: "Import your profile",
                  desc: "Connect LinkedIn or upload your CV to create your base profile.",
                },
                {
                  num: "2",
                  title: "Build your assets",
                  desc: "Generate a polished CV and optimized portfolio instantly.",
                },
                {
                  num: "3",
                  title: "Generate proposals",
                  desc: "Paste a job description and get a custom proposal in seconds.",
                },
                {
                  num: "4",
                  title: "Practice & Win",
                  desc: "Simulate the interview before the real call.",
                },
              ].map((step, i) => (
                <Fragment key={step.num}>
                  <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="font-sans text-lg text-foreground">{step.num}</span>
                    </div>
                    <h3 className="font-sans font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:flex items-center justify-center px-1 pt-8">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </Reveal>

          <Reveal delayMs={220} className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="font-sans font-medium text-center mb-6">
                Powered by advanced AI models
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-sm">
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <History className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-sans font-medium">Context Aware</div>
                    <div className="text-muted-foreground">Knows your history</div>
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-sans font-medium">Platform Specific</div>
                    <div className="text-muted-foreground">Tuned for Upwork/etc</div>
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-sans font-medium">Interactive</div>
                    <div className="text-muted-foreground">Voice & Text feedback</div>
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-sans font-medium">Secure</div>
                    <div className="text-muted-foreground">Private & Safe</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24  scroll-mt-28">
        <div className="container px-4 md:px-6 mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Features built for closing deals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop guessing what clients want. Give them exactly what they're looking for.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Proposal Generator",
                desc: "Analyzes job descriptions and your profile to write high-converting proposals.",
              },
              {
                icon: Users,
                title: "Interview Simulator",
                desc: "Practice with an AI that role-plays as your client (Technical, Discovery, etc).",
              },
              {
                icon: ShieldCheck,
                title: "CV Builder",
                desc: "Create targeted resumes for specific opportunities in minutes.",
              },
              {
                icon: Globe,
                title: "Profile Import",
                desc: "One-click import from LinkedIn to get started immediately.",
              },
              {
                icon: Briefcase,
                title: "Rate Negotiation",
                desc: "Practice salary and rate discussions to maximize your earnings.",
              },
              {
                icon: TrendingUp,
                title: "Feedback & Scoring",
                desc: "Get detailed feedback on your interview performance and proposal quality.",
              },
            ].map((feature, i) => (
              <Reveal key={feature.title} delayMs={80 + i * 40}>
                <div className="bg-card border border-border rounded-lg p-6 space-y-3 h-full hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-sans font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 ">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="order-2 lg:order-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-sans font-medium">Peace of Mind</h3>
                  <p className="text-sm text-muted-foreground">
                    Anxiety about &quot;what&apos;s next&quot; disappears.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-sans font-medium">Reliable Income</h3>
                  <p className="text-sm text-muted-foreground">
                    A continuous stream of opportunities.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-sans font-medium">More Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Dozens of hours freed per week.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-sans font-medium">Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Focus on professional growth and hobbies.
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-medium">
                What changes in your life?
              </h2>
              <p className="text-lg text-muted-foreground">
                This isn&apos;t about &quot;more money at any cost.&quot;
                It&apos;s about a{" "}
                <span className="text-foreground font-medium">
                  normal, sustainable life
                </span>
                .
              </p>
              <ul className="space-y-3">
                {[
                  "Travel without worrying about the next gig",
                  "Spend more time with family",
                  "Focus on your health",
                  "Stop living project to project",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl font-medium mb-12">Who is this for?</h2>
          </Reveal>
          <Reveal delayMs={120} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <div className="font-sans font-medium text-lg">Solo Freelancers</div>
              <p className="text-sm text-muted-foreground">
                Looking for stability and time freedom.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <div className="font-sans font-medium text-lg">Small Teams (2-10)</div>
              <p className="text-sm text-muted-foreground">
                Need a consistent project pipeline.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <div className="font-sans font-medium text-lg">Team Leaders</div>
              <p className="text-sm text-muted-foreground">
                Who need to keep their team busy.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={200}>
            <p className="mt-10 text-muted-foreground max-w-2xl mx-auto">
              It&apos;s like having an{" "}
              <span className="text-foreground font-medium">
                HR department for yourself
              </span>
              . Not for a company — for your life.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="access" className="py-24 scroll-mt-28">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-8 max-w-2xl">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-medium">Get Started</h2>
          </Reveal>
          <Reveal delayMs={120}>
            <p className="text-lg text-muted-foreground">
              Create your account and let your AI agent build your freelance
              profile in minutes.
            </p>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="bg-card border border-border rounded-lg p-8 max-w-sm mx-auto">
              <Button asChild className="w-full rounded-full py-6 text-base">
                <Link href="/login">
                  Get access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Free to use. No credit card required.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
