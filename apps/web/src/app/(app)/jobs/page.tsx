"use client"

export default function JobsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="text-4xl">🔍</div>
      <h1 className="text-lg font-medium">Job Discovery</h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        AI-matched job opportunities from LinkedIn and Upwork, scored and ranked
        for your profile.
      </p>
    </div>
  )
}
