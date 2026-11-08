"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db, isFirebaseConfigured } from "@/lib/firebase";

type FeedbackType = "feedback" | "bug" | "idea";

type FeedbackItem = {
  id: string;
  message: string;
  type: FeedbackType;
  userName: string;
  createdAtMs: number;
};

const FEEDBACK_LIMIT = 8;

const FEEDBACK_TYPE_OPTIONS: Array<{
  value: FeedbackType;
  label: string;
  mobileLabel: string;
}> = [
  { value: "feedback", label: "General Feedback", mobileLabel: "Feedback" },
  { value: "idea", label: "Feature Idea", mobileLabel: "Idea" },
  { value: "bug", label: "Bug Report", mobileLabel: "Bug" },
];

function getFeedbackTypeLabel(type: FeedbackType) {
  switch (type) {
    case "bug":
      return "Bug Report";
    case "idea":
      return "Feature Idea";
    default:
      return "Community Feedback";
  }
}

function getFeedbackAccent(type: FeedbackType) {
  switch (type) {
    case "bug":
      return "border-l-red-400 text-red-300 bg-red-500/10 border-red-500/20";
    case "idea":
      return "border-l-sky-400 text-sky-300 bg-sky-500/10 border-sky-500/20";
    default:
      return "border-l-accent text-accent bg-accent/10 border-accent/20";
  }
}

function formatFeedbackDate(createdAtMs: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(createdAtMs));
}

export default function CommunityFeedbackSection() {
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FeedbackType>("feedback");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isFirebaseConfigured) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const feedbackQuery = query(
      collection(db, "communityFeedback"),
      orderBy("createdAtMs", "desc"),
      limit(FEEDBACK_LIMIT)
    );

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const nextItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<FeedbackItem, "id">),
        }));
        setItems(nextItems);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to subscribe to community feedback:", snapshotError);
        setItems([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("Sign in first to post feedback for the Miru Hindi community.");
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Write a short message before posting.");
      return;
    }

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured, so feedback cannot be posted right now.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await addDoc(collection(db, "communityFeedback"), {
        uid: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Miru User",
        userEmail: user.email || null,
        message: trimmedMessage,
        type,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      });

      setMessage("");
      setType("feedback");
      setSuccess("Feedback posted. Thanks for helping improve Miru Hindi.");
    } catch (submitError) {
      console.error("Failed to post feedback:", submitError);
      setError("Could not post feedback right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="community-feedback" className="px-4 md:px-8 scroll-mt-24 md:scroll-mt-28">
      <div className="relative overflow-hidden border border-border-subtle bg-[linear-gradient(180deg,rgba(12,12,16,0.98),rgba(10,10,14,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:18px_18px] md:[background-size:24px_24px]" />

        <div className="relative grid gap-0 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="border-b border-border-subtle/70 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 border border-accent/25 bg-accent/10 px-3 py-1.5">
                  <span className="h-2 w-2 bg-accent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-accent">
                    Community Hub
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="section-heading text-2xl leading-tight md:text-4xl">
                    Community Feedback & Requests
                  </h2>
                  <p className="section-subtitle max-w-xl text-sm leading-relaxed md:text-base">
                    Drop anime requests, report broken links, or share suggestions with the community.
                  </p>
                </div>
              </div>

              <div>
                <a
                  href="https://instagram.com/exe_faizan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open developer Instagram profile"
                  className="group block w-full border border-border-subtle bg-bg-surface/65 px-4 py-4 transition-colors duration-300 hover:border-accent/35 hover:bg-bg-surface"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-accent">
                        Developer DM
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">@exe_faizan</h3>
                    </div>
                    <span className="pointer-events-none border border-accent/25 bg-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                      Open
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-content-tertiary">
                    For urgent bugs, collabs, and direct Miru Hindi feedback.
                  </p>
                </a>
              </div>

              <form onSubmit={handleSubmit} className="border border-border-subtle bg-bg-surface/55">
                <div className="border-b border-border-subtle/70 px-4 py-3 md:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-accent">
                        Write To The Hub
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white md:text-xl">
                        Quick public post
                      </h3>
                    </div>
                    <p className="text-xs text-content-tertiary">
                      {message.trim().length}/280 characters
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:space-y-5 md:p-5">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-content-tertiary">
                      Post Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {FEEDBACK_TYPE_OPTIONS.map((option) => {
                        const selected = type === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setType(option.value)}
                            className={`min-h-[48px] border px-2 py-2 text-center text-[11px] font-black uppercase tracking-[0.18em] transition-colors sm:px-3 ${
                              selected
                                ? "border-accent bg-accent text-bg-base"
                                : "border-border-subtle bg-bg-base text-content-secondary hover:border-accent/35 hover:text-content-primary"
                            }`}
                          >
                            <span className="sm:hidden">{option.mobileLabel}</span>
                            <span className="hidden sm:inline">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-content-tertiary">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={6}
                      maxLength={280}
                      placeholder="Tell the Miru Hindi community what feels broken, what should improve, or what feature you want next."
                      className="min-h-[160px] w-full resize-none border border-border-subtle bg-bg-base px-4 py-3 text-sm leading-relaxed text-content-primary placeholder:text-content-tertiary/60 outline-none transition-colors focus:border-accent/55"
                    />
                  </div>

                  <div className="grid gap-3 border-t border-border-subtle/70 pt-4">
                    <div className="flex flex-col gap-2 text-sm text-content-tertiary">
                      {user ? (
                        <span>
                          Posting as{" "}
                          <span className="font-semibold text-content-primary">
                            {user.displayName || user.email?.split("@")[0] || "Miru User"}
                          </span>
                        </span>
                      ) : (
                        <span>
                          <Link href="/signin" className="font-semibold text-accent hover:underline">
                            Sign in
                          </Link>{" "}
                          to post feedback to the public board.
                        </span>
                      )}
                      <span className="text-xs text-content-tertiary/80">
                        Please keep posts respectful and helpful.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !isFirebaseConfigured}
                      className="inline-flex min-h-[48px] w-full items-center justify-center bg-accent px-5 text-xs font-black uppercase tracking-[0.24em] text-bg-base transition-all duration-300 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {submitting ? "Posting..." : "Post Feedback"}
                    </button>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {success && <p className="text-sm text-green-400">{success}</p>}
                  {!isFirebaseConfigured && (
                    <p className="text-sm text-content-tertiary">
                      Feedback posting appears disabled because Firebase is not configured for this environment.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-8">
            <div className="border border-border-subtle bg-bg-surface/45">
              <div className="border-b border-border-subtle/70 px-4 py-3 md:px-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-accent">
                      Latest Community Posts
                    </p>
                    <h3 className="text-xl font-semibold text-white md:text-2xl">
                      What viewers want next
                    </h3>
                  </div>
                  <div className="border border-border-subtle bg-bg-base px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-content-tertiary">
                    {items.length} posts
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-content-tertiary">
                  Live suggestions, feature asks, and bug reports from the Miru Hindi community.
                </p>
              </div>

              <div className="space-y-3 p-4 md:p-5">
                {loading && (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse border border-border-subtle bg-bg-base/70 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-24 bg-bg-surface" />
                          <div className="h-3 w-20 bg-bg-surface" />
                        </div>
                        <div className="mt-3 h-3 w-full bg-bg-surface" />
                        <div className="mt-2 h-3 w-4/5 bg-bg-surface" />
                      </div>
                    ))}
                  </div>
                )}

                {!loading && items.length === 0 && (
                  <div className="border border-dashed border-border-subtle bg-bg-base/60 p-6 text-center">
                    <p className="text-sm text-content-secondary">
                      No community feedback yet. Be the first one to post an idea for Miru Hindi.
                    </p>
                  </div>
                )}

                {!loading && items.length > 0 && (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className={`border border-border-subtle bg-bg-base/75 p-4 transition-colors duration-300 hover:border-border-medium ${getFeedbackAccent(
                          item.type
                        )} border-l-[3px]`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="border border-current/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                            {getFeedbackTypeLabel(item.type)}
                          </span>
                          <span className="text-xs font-semibold text-content-primary">
                            {item.userName}
                          </span>
                          <span className="text-xs text-content-tertiary">
                            {formatFeedbackDate(item.createdAtMs)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-content-secondary">
                          {item.message}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
