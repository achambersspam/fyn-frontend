"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    }
    check();
  }, [router]);

  if (checking) return null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="max-w-[820px] w-full mx-auto text-center space-y-4 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-0">
          <img
            src="/logo-FYN-cursive-script.svg"
            alt="For You Newsletter"
            className="h-[20.7rem] w-auto object-contain"
          />
          <img
            src="/logo-pigeon-envelope-v.2-.svg"
            alt="For You Newsletter"
            className="h-[15.18rem] w-auto object-contain -mt-[95px]"
          />
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-base leading-relaxed px-4 dark:text-gray-300">
            Create your very own For You Newsletter!
            <br />
            We deliver only what you want, when you want it.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/auth" className="block">
            <button className="w-full btn-primary text-lg">Get Started</button>
          </Link>
          <p className="text-gray-600 text-sm dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth"
              className="text-primary font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
