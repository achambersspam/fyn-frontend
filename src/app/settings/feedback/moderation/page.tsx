"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "@/components/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type ModerationPost = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at?: string | null;
};

type ModerationComment = {
  id: string;
  post_id: string;
  body: string;
  status: string;
  created_at?: string | null;
};

type Queue = {
  posts: ModerationPost[];
  comments: ModerationComment[];
};

export default function FeedbackModerationPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [queue, setQueue] = useState<Queue>({ posts: [], comments: [] });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("fyn_feedback_moderation_secret");
    if (stored) setSecret(stored);
  }, []);

  const authedFetch = async (init?: RequestInit) => {
    const {
      data: { session },
    } = await getSupabaseBrowserClient().auth.getSession();
    if (!session?.access_token) {
      router.replace("/auth");
      throw new Error("Session expired.");
    }
    return fetch(`${API_BASE_URL}/api/feedback/moderation`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        "x-founder-secret": secret,
        ...(init?.headers || {}),
      },
      credentials: "include",
    });
  };

  const loadQueue = async () => {
    setError(null);
    setLoading(true);
    try {
      window.sessionStorage.setItem("fyn_feedback_moderation_secret", secret);
      const response = await authedFetch();
      if (!response.ok) throw new Error("Could not load moderation queue.");
      setQueue(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load moderation queue.");
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (type: "post" | "comment", id: string, status: "approved" | "rejected") => {
    setError(null);
    setBusyId(id);
    try {
      const response = await authedFetch({
        method: "PATCH",
        body: JSON.stringify({ type, id, status }),
      });
      if (!response.ok) throw new Error("Could not update moderation status.");
      setQueue((current) => ({
        posts: current.posts.filter((post) => post.id !== id),
        comments: current.comments.filter((comment) => comment.id !== id),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update moderation status.");
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (type: "post" | "comment", id: string) => (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busyId === id}
        onClick={() => moderate(type, id, "approved")}
        className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={busyId === id}
        onClick={() => moderate(type, id, "rejected")}
        className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() => router.push("/settings/feedback")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary dark:text-gray-300"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to feedback
        </button>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Founder only</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
            Feedback Moderation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Approve or reject pending feedback before it becomes public.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              type="password"
              placeholder="Founder moderation secret"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={loadQueue}
              disabled={!secret.trim() || loading}
              className="rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load queue"}
            </button>
          </div>
          {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Posts</h2>
            <div className="mt-4 space-y-3">
              {queue.posts.length === 0 && <p className="text-sm text-gray-500">No pending posts loaded.</p>}
              {queue.posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{post.title}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{post.body}</p>
                      <p className="mt-2 text-xs text-gray-400">{post.status}</p>
                    </div>
                    {renderActions("post", post.id)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Comments</h2>
            <div className="mt-4 space-y-3">
              {queue.comments.length === 0 && <p className="text-sm text-gray-500">No pending comments loaded.</p>}
              {queue.comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{comment.body}</p>
                      <p className="mt-2 text-xs text-gray-400">Post {comment.post_id} · {comment.status}</p>
                    </div>
                    {renderActions("comment", comment.id)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
