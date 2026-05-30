"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, MessageCircle, ThumbsDown, ThumbsUp } from "@/components/Icons";
import { api, type ApiError } from "@/lib/api";
import type { FeedbackComment, FeedbackPost, Profile } from "@/lib/apiContracts";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type UiFeedbackComment = FeedbackComment & {
  author_label?: string;
  optimistic?: boolean;
};

export default function FeedbackBoardPage() {
  const router = useRouter();
  const [feedbackPosts, setFeedbackPosts] = useState<FeedbackPost[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackBody, setFeedbackBody] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackActionBusy, setFeedbackActionBusy] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, UiFeedbackComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [currentUserLabel, setCurrentUserLabel] = useState("You");

  const toUiError = (err: unknown, fallback: string) => {
    if (err && typeof err === "object" && "message" in err) {
      return String((err as { message?: unknown }).message || fallback);
    }
    return fallback;
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;
    const load = async () => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace("/auth");
        if (!cancelled) setFeedbackLoading(false);
        return;
      }
      try {
        const [posts, profile] = await Promise.all([
          api.get<FeedbackPost[]>("/api/feedback"),
          api.get<Profile>("/api/me").catch(() => null),
        ]);
        if (cancelled) return;
        setFeedbackPosts(posts);
        const name = profile?.name?.trim();
        setCurrentUserLabel(name || "You");
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) {
          router.replace("/auth");
          return;
        }
        setFeedbackError("Could not load feedback board right now.");
      } finally {
        if (!cancelled) setFeedbackLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const refreshFeedback = async () => {
    const posts = await api.get<FeedbackPost[]>("/api/feedback");
    setFeedbackPosts(posts);
  };

  const submitFeedback = async () => {
    if (!feedbackBody.trim() || isSubmittingFeedback) {
      setFeedbackError("Please add your feedback before submitting.");
      return;
    }
    const trimmed = feedbackBody.trim();
    const generatedTitle = trimmed.slice(0, 80);
    setFeedbackError(null);
    setIsSubmittingFeedback(true);
    try {
      await api.post("/api/feedback", { title: generatedTitle, body: trimmed });
      setFeedbackBody("");
      void refreshFeedback().catch(() => undefined);
    } catch (err: unknown) {
      setFeedbackError(toUiError(err, "Failed to submit feedback."));
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const voteFeedback = async (post: FeedbackPost, vote: 1 | -1) => {
    setFeedbackError(null);
    const postId = post.id;
    const effectiveVote = post.user_vote === vote ? 0 : vote;
    const previousPosts = feedbackPosts;
    setFeedbackPosts((prev) =>
      prev.map((item) => {
        if (item.id !== postId) return item;
        const previousVote = item.user_vote;
        const nextUp =
          item.votes.up -
          (previousVote === 1 ? 1 : 0) +
          (effectiveVote === 1 ? 1 : 0);
        const nextDown =
          item.votes.down -
          (previousVote === -1 ? 1 : 0) +
          (effectiveVote === -1 ? 1 : 0);
        return {
          ...item,
          user_vote: effectiveVote,
          votes: {
            up: Math.max(0, nextUp),
            down: Math.max(0, nextDown),
          },
        };
      })
    );
    setFeedbackActionBusy(`vote:${postId}`);
    try {
      await api.post(`/api/feedback/${postId}/vote`, { vote: effectiveVote });
      void refreshFeedback().catch(() => undefined);
    } catch (err: unknown) {
      setFeedbackPosts(previousPosts);
      setFeedbackError(toUiError(err, "Could not save your vote right now."));
    } finally {
      setFeedbackActionBusy(null);
    }
  };

  const loadComments = async (postId: string) => {
    setFeedbackError(null);
    setFeedbackActionBusy(`comments:${postId}`);
    try {
      const comments = await api.get<FeedbackComment[]>(`/api/feedback/${postId}/comments`);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: comments.map((comment) => ({
          ...comment,
          author_label: comment.is_owner ? currentUserLabel : "Anonymous User",
        })),
      }));
      setActiveCommentsPostId((prev) => (prev === postId ? null : postId));
    } catch (err: unknown) {
      setFeedbackError(toUiError(err, "Could not load comments right now."));
    } finally {
      setFeedbackActionBusy(null);
    }
  };

  const submitComment = async (post: FeedbackPost) => {
    if (post.status !== "approved") {
      setFeedbackError("Comments are only available after a post is approved.");
      return;
    }
    const postId = post.id;
    const body = (commentDrafts[postId] || "").trim();
    if (!body) return;
    setFeedbackError(null);
    setFeedbackActionBusy(`comment:${postId}`);
    const optimisticId = `temp-${Date.now()}`;
    const optimisticComment: UiFeedbackComment = {
      id: optimisticId,
      post_id: postId,
      user_id: "local-user",
      body,
      status: "pending",
      created_at: new Date().toISOString(),
      is_owner: true,
      author_label: currentUserLabel,
      optimistic: true,
    };
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), optimisticComment],
    }));
    try {
      const created = await api.post<FeedbackComment>(`/api/feedback/${postId}/comments`, { body });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((comment) =>
          comment.id === optimisticId
            ? {
                ...created,
                author_label: currentUserLabel,
              }
            : comment
        ),
      }));
      void refreshFeedback().catch(() => undefined);
    } catch (err: unknown) {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((comment) => comment.id !== optimisticId),
      }));
      setFeedbackError(toUiError(err, "Could not submit comment right now."));
    } finally {
      setFeedbackActionBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-[820px] w-full mx-auto flex items-center gap-3 px-4 sm:px-6 lg:px-10 py-4">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Feedback Board
          </h1>
        </div>
      </div>

      <div className="max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Feedback and comments are private until admin approval. Approved posts are visible to the community.
          </p>
          <div className="space-y-2">
            <textarea
              value={feedbackBody}
              onChange={(e) => setFeedbackBody(e.target.value)}
              maxLength={1200}
              rows={5}
              placeholder="share your feedback, ideas, or any comments you may have"
              className="input-field"
            />
            <button
              onClick={submitFeedback}
              disabled={isSubmittingFeedback}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </button>
            {feedbackError && (
              <div className="rounded-2xl border border-red-500/90 bg-red-500/10 px-4 py-3 text-sm font-semibold text-white">
                {feedbackError}
              </div>
            )}
          </div>
        </div>

        {feedbackLoading ? (
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-gray-100 animate-pulse dark:bg-slate-800" />
            <div className="h-16 rounded-xl bg-gray-100 animate-pulse dark:bg-slate-800" />
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-gray-200 p-4 sm:p-5 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{post.title}</h3>
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {post.status === "approved" ? "approved public post" : post.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{post.body}</p>
                <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  -{post.author_label || "Anonymous User"}
                </p>
                {post.status !== "approved" && (
                  <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    This post is private until moderation approval. Voting and public comments are disabled.
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <button
                    onClick={() => voteFeedback(post, 1)}
                    disabled={post.status !== "approved" || feedbackActionBusy === `vote:${post.id}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                      post.user_vote === 1
                        ? "border-sky-500 text-sky-500 bg-sky-500/10"
                        : "border-sky-200 text-sky-500 dark:border-sky-800 dark:text-sky-300"
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span>{post.votes.up}</span>
                  </button>
                  <button
                    onClick={() => voteFeedback(post, -1)}
                    disabled={post.status !== "approved" || feedbackActionBusy === `vote:${post.id}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                      post.user_vote === -1
                        ? "border-sky-500 text-sky-500 bg-sky-500/10"
                        : "border-sky-200 text-sky-500 dark:border-sky-800 dark:text-sky-300"
                    }`}
                  >
                    <ThumbsDown size={14} />
                    <span>{post.votes.down}</span>
                  </button>
                  <button
                    onClick={() => loadComments(post.id)}
                    disabled={post.status !== "approved" || feedbackActionBusy === `comments:${post.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 text-sky-500 dark:border-sky-800 dark:text-sky-300"
                  >
                    <MessageCircle size={14} />
                    <span>{post.approved_comment_count}</span>
                  </button>
                </div>
                {post.status === "approved" && activeCommentsPostId === post.id && (
                  <div className="mt-3 space-y-2">
                    {(commentsByPost[post.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                        <div className="flex items-start justify-between gap-3">
                          <p className="leading-relaxed">{comment.body}</p>
                          <span className="shrink-0 text-xs uppercase text-gray-400">
                            {comment.status === "pending" ? "pending approval" : comment.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          - {comment.author_label || (comment.is_owner ? currentUserLabel : "Anonymous User")}
                        </p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        className="input-field"
                        placeholder="Add comment (requires approval to be seen publicly)"
                      />
                      <button
                        onClick={() => submitComment(post)}
                        disabled={feedbackActionBusy === `comment:${post.id}`}
                        className="btn-outline"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
