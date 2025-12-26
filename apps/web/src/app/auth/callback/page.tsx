"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        setError(sessionError?.message ?? "Unable to complete sign in");
        setStatus("error");
        return;
      }

      router.replace("/app/overview");
    }

    handleCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-zinc-950">
            Sign in failed
          </h1>
          <p className="text-sm text-red-600">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-zinc-950">
          Completing sign in
        </h1>
        <p className="text-sm text-zinc-600">
          Please wait while we finish logging you in.
        </p>
      </main>
    </div>
  );
}

