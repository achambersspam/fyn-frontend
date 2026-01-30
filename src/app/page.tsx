"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="max-w-[820px] w-full mx-auto text-center space-y-8 px-4 sm:px-6 lg:px-10">
        <Logo variant="envelope" className="w-60 h-60 mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
            For You Newsletter
          </h1>
          
          <p className="text-gray-600 text-base leading-relaxed px-4 dark:text-gray-300">
            Stay ahead of the curve. We research, build, and summarize your favorite topics into daily bite-sized insights.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <Link href="/auth" className="block">
            <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 text-lg">
              Get Started
            </button>
          </Link>

          <p className="text-gray-600 text-sm dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/auth" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
