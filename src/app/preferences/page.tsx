"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { NewsletterInput } from "@/lib/apiContracts";
import {
  Plus,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Trophy,
  Landmark,
  Cpu,
  Bitcoin,
  Heart,
  BookOpen,
  Brain,
  Mail,
  Compass,
  Target,
  Clock,
  Timer,
} from "lucide-react";

const INTEREST_OPTIONS = [
  {
    label: "Stock Market News",
    description: "Pick your favorite stocks to watch or follow the whole market",
    icon: TrendingUp,
  },
  {
    label: "Sports",
    description: "What are your favorite college or professional sports teams?",
    icon: Trophy,
  },
  {
    label: "Politics",
    description: "U.S. politics or global political affairs",
    icon: Landmark,
  },
  {
    label: "Tech News",
    description: "AI, healthcare, startups, or major tech innovations",
    icon: Cpu,
  },
  {
    label: "Crypto",
    description: "Bitcoin, Ethereum, DeFi, and crypto markets",
    icon: Bitcoin,
  },
  {
    label: "Motivational Quotes",
    description: "Motivational quotes or inspiring stories",
    icon: Heart,
  },
  {
    label: "History Facts",
    description: "Quick interesting stories from different historical eras",
    icon: BookOpen,
  },
  {
    label: "Brain Teasers/Riddles",
    description: "Fun mental games to start or end your day",
    icon: Brain,
  },
  {
    label: "Learn a new topic",
    description:
      "Learn about personal finance, science facts, the stock market, or just daily fun facts",
    icon: Sparkles,
  },
];

const FREQUENCIES = [
  "Daily",
  "Mon./Wed./Fri",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
];
const TIMES = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export default function PreferencesPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [time, setTime] = useState("08:00 AM");
  const [readTime, setReadTime] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readTimeMin = 1;
  const readTimeMax = 10;
  const recommendedReadTime = 3;
  const recommendedPercent =
    ((recommendedReadTime - readTimeMin) / (readTimeMax - readTimeMin)) * 100;

  const formatCustomTopic = (interests: string[]) =>
    interests.map((item) => `${item} (Type Details Here)`).join(", ");

  const appendTopicDetails = (current: string, interest: string) => {
    const entry = `${interest} (Type Details Here)`;
    if (current.includes(entry)) {
      return current;
    }
    return current.trim().length > 0 ? `${current}, ${entry}` : entry;
  };

  const removeTopicDetails = (current: string, interest: string) => {
    const prefix = `${interest} (`;
    const parts = current.split(",").map((part) => part.trim());
    const filtered = parts.filter((part) => part && !part.startsWith(prefix));
    return filtered.join(", ");
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      const updated = selectedInterests.filter((i) => i !== interest);
      setSelectedInterests(updated);
      setCustomTopic((current) => removeTopicDetails(current, interest));
    } else {
      const updated = [...selectedInterests, interest];
      setSelectedInterests(updated);
      setCustomTopic((current) => appendTopicDetails(current, interest));
    }
  };

  const handleInterestClick = (interest: string) => {
    toggleInterest(interest);
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedInterests.includes(customTopic.trim())) {
      setSelectedInterests([...selectedInterests, customTopic.trim()]);
      setCustomTopic("");
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError(null);

    const payload: NewsletterInput = {
      title: "My Newsletter",
      email,
      topics: selectedInterests,
      primaryGoal,
      customTopic,
      frequency,
      time,
      readTime,
    };

    api
      .post("/newsletters", payload)
      .then(() => router.push("/dashboard"))
      .catch((err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Unable to save your newsletter. Please try again.";
        setError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-white pb-12 dark:bg-slate-950">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-3 z-10 dark:bg-slate-950 dark:border-slate-800">
        <button onClick={() => router.back()} className="text-gray-600 dark:text-gray-300">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">Newsletter Setup</h1>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Create Your For You Newsletter
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Personalize Your Own Newsletter!</p>
        </div>

        <div className="flex justify-center -mt-[50px] -mb-[50px]">
          <img
            src="/logo-pigeon-devices.png"
            alt="Pigeon with devices"
            className="w-[21.8rem] h-auto block leading-none -mt-[70px] -mb-[60px]"
          />
        </div>

        <div className="-mt-[200px]">
          <label className="flex items-center gap-2 text-gray-900 font-bold mb-3 dark:text-gray-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail size={14} />
            </span>
            Where should we send it?
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-gray-900 font-bold mb-3 dark:text-gray-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass size={14} />
            </span>
            Choose your interests
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {INTEREST_OPTIONS.map(({ label, description, icon: Icon }) => {
              const isSelected = selectedInterests.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => handleInterestClick(label)}
                  className={`text-left rounded-2xl border-2 p-3 min-h-[140px] transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white hover:border-primary/60 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-3 dark:text-gray-400">
                    {description}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedInterests.filter(
            (interest) => !INTEREST_OPTIONS.some((option) => option.label === interest)
          ).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedInterests
                .filter(
                  (interest) =>
                    !INTEREST_OPTIONS.some((option) => option.label === interest)
                )
                .map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className="tag-chip tag-chip-selected"
                  >
                    {interest}
                  </button>
                ))}
            </div>
          )}

          <p className="text-sm text-primary mb-3">Specific Details Are What Make It Yours!</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomTopic()}
              placeholder="Type your specific topics with details here..."
              className="input-field flex-1"
            />
            <button
              onClick={addCustomTopic}
              className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-gray-900 font-bold mb-3 dark:text-gray-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target size={14} />
            </span>
            What's your primary goal?
          </label>
          <textarea
            value={primaryGoal}
            onChange={(e) => setPrimaryGoal(e.target.value)}
            placeholder="Are you new to this topic and wanting to learn more? Or do you want a quick update on the latest news..."
            className="input-field min-h-[120px] resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-gray-900 font-bold mb-4 dark:text-gray-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock size={14} />
            </span>
            Delivery Settings
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">FREQUENCY</p>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="input-field"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">TIME</p>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field"
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-gray-900 font-bold mb-3 dark:text-gray-100">
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Timer size={14} />
              </span>
              Target Read Time
            </span>
            <span className="text-primary text-lg">~{readTime} mins</span>
          </label>
          
          <div className="relative">
            <input
              type="range"
              min={readTimeMin}
              max={readTimeMax}
              step="1"
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
              className="w-full h-2 bg-primary/30 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-primary/40"
            />
            <div
              className="absolute top-5 -translate-x-1/2 text-center text-primary text-xs font-semibold"
              style={{ left: `${recommendedPercent}%` }}
            >
              <div className="absolute left-[-35px] top-[8px]">Recommended</div>
              <div className="absolute left-[-19px] top-[23px] min-w-[48px] whitespace-nowrap">
                {recommendedReadTime} min
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 dark:text-gray-400">
            <span>Short (1m)</span>
            <span>Long (10m)</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || selectedInterests.length === 0 || isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl text-lg transition-all transform hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          {isSubmitting ? "Saving..." : "Create My Newsletter"}
          <Sparkles size={20} />
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          You can change these settings anytime later.
        </p>

        <div className="flex justify-center pt-4 opacity-60" />
      </div>
    </div>
  );
}
