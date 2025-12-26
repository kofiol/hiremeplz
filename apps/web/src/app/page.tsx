"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "./auth/session-provider";

export default function Home() {
  const { session, isLoading } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {isLoading && "Checking your session..."}
            {!isLoading &&
              (session
                ? "You are signed in. Continue to your dashboard."
                : "Sign in with a magic link to access your dashboard.")}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {!isLoading && (
            <>
              {session ? (
                <Link
                  href="/app/overview"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-zinc-50 transition-colors hover:bg-zinc-800 md:w-[180px]"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-zinc-50 transition-colors hover:bg-zinc-800 md:w-[180px]"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
