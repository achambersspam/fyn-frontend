"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Globe, Heart, TrendingUp, Zap } from "@/components/Icons";
import { api } from "@/lib/api";
import type { TrendingTopic, ExploreTopic } from "@/lib/apiContracts";

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
    title: "AI Daily Newsletter",
    description:
      "Breaking developments in artificial intelligence and machine learning.",
    tag: "Trending",
    category: "Tech/AI",
  },
  {
    title: "Market Pulse",
    description:
      "Real-time updates on global financial markets and trading insights.",
    tag: "Hot",
    category: "Finance",
  },
  {
    title: "Climate Tech Weekly",
    description:
      "Latest innovations in sustainable technology and green energy.",
    tag: "Featured",
    category: "Environment",
  },
];

const fallbackExplore: ExploreTopic[] = [
  {
    title: "History Facts & Stories",
    description: "Quick, fascinating stories from different eras and cultures.",
  },
  {
    title: "Personal Finance Tips",
    description:
      "Practical advice for budgeting, saving, and smarter money habits.",
  },
  {
    title: "Motivational Quotes & Stories",
    description: "Uplifting quotes and short stories to boost your day.",
  },
];

function TrendingCard({
  icon: Icon,
  title,
  description,
  tag,
  category,
}: {
  icon: CardIcon;
  title: string;
  description: string;
  tag: string;
  category: string;
}) {
  return (
    <div className="snap-center shrink-0 w-72 bg-white rounded-3xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800">
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
    </div>
  );
}

function ExploreCard({
  icon: Icon,
  title,
  description,
}: {
  icon: CardIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800">
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
    </div>
  );
}

export default function DiscoverPage() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [exploreNew, setExploreNew] = useState<ExploreTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
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
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to load discovery topics.";
        setError(message);
        setTrendingTopics(fallbackTrending);
        setExploreNew(fallbackExplore);
      })
      .finally(() => setIsLoading(false));
  }, []);

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
              Trending Now
            </h2>
          </div>

          {isLoading && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 text-gray-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400">
              Loading trending topics...
            </div>
          )}

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 snap-x snap-mandatory">
            {displayTrending.map((topic) => (
              <TrendingCard
                key={topic.title}
                title={topic.title}
                description={topic.description}
                tag={topic.tag}
                category={topic.category}
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

      <BottomNav />
    </div>
  );
}
