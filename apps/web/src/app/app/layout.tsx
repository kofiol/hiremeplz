"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../auth/session-provider";
import { supabase } from "@/lib/supabaseClient";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
    setIsLoggingOut(false);
  }, [router]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm text-zinc-600">
            Checking your session. Please wait.
          </p>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white p-4 md:block">
        <div className="mb-6 text-sm font-semibold text-zinc-900">
          HireMePlz
        </div>
        <nav className="space-y-2 text-sm">
          <div className="font-medium text-zinc-900">Overview</div>
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </aside>
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
