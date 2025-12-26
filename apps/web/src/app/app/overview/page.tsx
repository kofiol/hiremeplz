"use client";

import { useSession } from "../../auth/session-provider";

export default function OverviewPage() {
  const { session, isLoading } = useSession();

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50">
      <main className="w-full max-w-3xl p-8">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-950">
          Overview
        </h1>
        {isLoading && (
          <p className="text-sm text-zinc-600">Loading your session...</p>
        )}
        {!isLoading && session && (
          <p className="text-sm text-zinc-600">
            Signed in as {session.user.email}
          </p>
        )}
      </main>
    </div>
  );
}
