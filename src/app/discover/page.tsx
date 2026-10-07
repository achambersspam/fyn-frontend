"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Globe, Heart, TrendingUp, X, Zap } from "@/components/Icons";
import Tooltip from "@/components/Tooltip";
import { api } from "@/lib/api";
import type {
  TrendingTopic,
  ExploreTopic,
  Newsletter,
  Profile,
  Tier,
} from "@/lib/apiContracts";
import { TIER_LIMITS } from "@/lib/apiContracts";
import { errorMessage } from "@/lib/errorMessage";

type CardIcon = React.ComponentType<{ size?: number; className?: string }>;

const iconMap: Record<string, CardIcon> = {
  Zap,
  TrendingUp,
  Globe,
  BookOpen,
  Heart,
};

const fallbackTrending: TrendingTopic[] = [
  {
    title: "Tech & AI",
    description:
      "The latest AI model launches, chipmakers, and product releases.",
    tag: "Trending",
    category: "Technology",
    href: "/setup",
  },
  {
    title: "Stock Market",
    description:
      "Track your tickers and indexes with live quotes and market context.",
    tag: "Popular",
    category: "Finance",
    href: "/setup",
  },
  {
    title: "Sports",
    description: "Your exact teams — scores, roster moves, and matchups.",
    tag: "Popular",
    category: "Sports",
    href: "/setup",
  },
];

const fallbackExplore: ExploreTopic[] = [
  {
    title: "Fun Facts",
    description: "A rotating set of genuinely interesting facts you can tune.",
    href: "/setup",
  },
  {
    title: "Personal Finance",
    description:
      "Practical advice for budgeting, saving, and smarter money habits.",
    href: "/setup",
  },
  {
    title: "Motivational Quotes & Stories",
    description: "Uplifting quotes and short stories to boost your day.",
    href: "/setup",
  },
];

function TrendingCard({
  icon: Icon,
  title,
  description,
  tag,
  category,
  onOpen,
}: {
  icon: CardIcon;
  title: string;
  description: string;
  tag: string;
  category: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="snap-center shrink-0 w-72 text-left bg-white rounded-3xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all dark:bg-slate-900 dark:border-slate-800"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Icon className="text-primary" size={22} />
        </div>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black dark:bg-slate-800 dark:text-gray-200">
          {tag}
        </span>
      </div>
      <h3 className="font-black text-gray-900 text-lg mb-2 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4 dark:text-gray-300">
        {description}
      </p>
      <span className="text-xs text-gray-500 font-bold dark:text-gray-400">
        {category}
      </span>
    </button>
  );
}

function ExploreCard({
  icon: Icon,
  title,
  description,
  onOpen,
}: {
  icon: CardIcon;
  title: string;
  description: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
          <Icon className="text-primary" size={20} />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-base mb-1 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-600 text-sm font-medium dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("basic");
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [blockedTopic, setBlockedTopic] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [exploreNew, setExploreNew] = useState<ExploreTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    Promise.all([
      api.get<TrendingTopic[]>("/api/discover/trending"),
      api.get<ExploreTopic[]>("/api/discover/explore"),
    ])
      .then(([trending, explore]) => {
        setTrendingTopics(Array.isArray(trending) ? trending : []);
        setExploreNew(Array.isArray(explore) ? explore : []);
      })
      .catch((err) => {
        setError(errorMessage(err, "Unable to load discovery topics."));
        setTrendingTopics(fallbackTrending);
        setExploreNew(fallbackExplore);
      });
  }, []);

  useEffect(() => {
    Promise.all([api.get<Profile>("/api/me"), api.get<Newsletter[]>("/api/newsletters")])
      .then(([profile, list]) => {
        setTier(profile?.tier ?? "basic");
        setNewsletterCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (blockedTopic === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBlockedTopic(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blockedTopic]);

  const maxNewsletters = (TIER_LIMITS[tier] ?? TIER_LIMITS.basic).maxNewsletters;
  // A new topic means a new newsletter; stop at the plan limit here instead of at the end of setup.
  const openTopic = (title: string, href?: string) => {
    if (newsletterCount >= maxNewsletters) setBlockedTopic(title);
    else router.push(href || "/setup");
  };
  // Anything that is not Plus or Premium is treated as Free (new profiles can report "free").
  const nextPlan =
    tier === "premium"
      ? null
      : tier === "minimum"
        ? { name: "Premium", count: 5 }
        : { name: "Plus", count: 2 };

  const displayTrending =
    trendingTopics.length > 0 ? trendingTopics : fallbackTrending;
  const displayExplore =
    exploreNew.length > 0 ? exploreNew : fallbackExplore;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-6 shadow-sm dark:bg-slate-950 dark:border-slate-800">
        <h1 className="text-3xl font-black text-gray-900 text-center dark:text-gray-100">
          Discover
        </h1>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm dark:bg-slate-900">
              <Zap className="text-gray-700 dark:text-gray-300" size={20} />
            </div>
            <h2 className="font-black text-gray-900 text-xl dark:text-gray-100">
              Trending Topics
            </h2>
          </div>
          <div className="themed-discover-scrollbar flex gap-4 overflow-x-auto pb-2 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 snap-x snap-mandatory">
            {displayTrending.map((topic) => (
              <TrendingCard
                key={topic.title}
                title={topic.title}
                description={topic.description}
                tag={topic.tag}
                category={topic.category}
                onOpen={() => openTopic(topic.title, topic.href)}
                icon={Zap}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800" />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm dark:bg-slate-900">
              <Globe className="text-gray-700 dark:text-gray-300" size={20} />
            </div>
            <h2 className="font-black text-gray-900 text-xl dark:text-gray-100">
              Explore Something New
            </h2>
          </div>
          <div className="space-y-3">
            {displayExplore.map((item) => (
              <ExploreCard
                key={item.title}
                title={item.title}
                description={item.description}
                onOpen={() => openTopic(item.title, item.href)}
                icon={BookOpen}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            Showing fallback topics. Live data unavailable.
          </p>
        )}
      </div>

      {blockedTopic !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5 backdrop-blur-md"
          onClick={() => setBlockedTopic(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discover-upgrade-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white px-6 pb-6 pt-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="absolute right-3.5 top-3.5">
              <Tooltip label="Close">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setBlockedTopic(null)}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  <X size={16} />
                </button>
              </Tooltip>
            </div>
            <div className="flex flex-col items-center gap-3 pt-1 text-center">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary/10">
                <Zap size={26} className="text-primary" />
              </div>
              <h2
                id="discover-upgrade-title"
                className="text-xl font-black text-gray-900 dark:text-gray-100"
              >
                Add {blockedTopic} to a new newsletter
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
                {nextPlan
                  ? `Your current plan includes ${maxNewsletters} newsletter${
                      maxNewsletters === 1 ? "" : "s"
                    }, and you're already using ${
                      maxNewsletters === 1 ? "it" : "all of them"
                    }. To create a brand-new newsletter with ${blockedTopic}, upgrade to ${
                      nextPlan.name
                    } to get access to ${nextPlan.count} newsletters.`
                  : `You're using all ${maxNewsletters} newsletters included in Premium. To add ${blockedTopic}, edit one of your existing newsletters from the Newsletter tab.`}
              </p>
            </div>
            <div className="mt-5 space-y-2.5">
              {nextPlan ? (
                <Tooltip label="See plans and upgrade" className="w-full">
                  <button
                    type="button"
                    onClick={() => router.push("/subscription")}
                    className="w-full btn-primary"
                  >
                    Upgrade Subscription
                  </button>
                </Tooltip>
              ) : (
                <Tooltip label="Open your newsletters to edit one" className="w-full">
                  <button
                    type="button"
                    onClick={() => router.push("/newsletter")}
                    className="w-full btn-primary"
                  >
                    Go to My Newsletters
                  </button>
                </Tooltip>
              )}
              <button
                type="button"
                onClick={() => setBlockedTopic(null)}
                className="w-full btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
