// app/comics/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import ComicCard from "@/components/ComicCard";
import { comics as mockComics } from "@/mockData/comics";
import Loader from "@/components/Loader";
import styles from "./ComicDetailPage.module.css";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";

type Comic = {
  id: number | string;
  title: string;
  author?: string;
  cover: string;
  year?: number;
  description?: string;
};

type ShelfKey = "favorites" | "readLater" | "alreadyRead";

type ShelfState = {
  favorites: boolean;
  readLater: boolean;
  alreadyRead: boolean;
};

type Comment = {
  _id: string;
  username: string;
  text: string;
  likes: string[];
  createdAt: string;
  user?: string;
};

export default function ComicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();

  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧺 shelf state (which lists this comic is in)
  const [shelves, setShelves] = useState<ShelfState>({
    favorites: false,
    readLater: false,
    alreadyRead: false,
  });
  const [checkingShelves, setCheckingShelves] = useState(false);

  // 💬 comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🔁 1. Load comic (mock first, then ComicVine)
  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setError(null);

      // 1) Try mock comics first
      const mock = mockComics.find((c) => String(c.id) === String(id));
      if (mock) {
        setComic({
          id: mock.id,
          title: mock.title,
          author: mock.author,
          cover: mock.cover,
          year: mock.year,
          description: mock.description,
        });
        setLoading(false);
        return;
      }

      // 2) Fallback to live ComicVine volume
      try {
        const res = await fetch(`/api/cv/volume/${id}`);
        const data = await res.json();

        if (!res.ok || !data?.result) {
          setError("Comic not found.");
          setComic(null);
        } else {
          const v = data.result;
          setComic({
            id: v.id,
            title: v.title,
            author: v.publisher || "—",
            cover: v.cover,
            year: Number(v.year) || 0,
            description: v.description,
          });
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load comic.");
        setComic(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // 🔁 2. Derive shelf membership from the auth context user
  useEffect(() => {
    if (!comic) return;

    if (!user) {
      setShelves({
        favorites: false,
        readLater: false,
        alreadyRead: false,
      });
      return;
    }

    const vid = String(comic.id);

    const inFav = user.favorites?.some((c: any) => c.volumeId === vid);
    const inReadLater = user.readLater?.some((c: any) => c.volumeId === vid);
    const inAlreadyRead = user.alreadyRead?.some(
      (c: any) => c.volumeId === vid
    );

    setShelves({
      favorites: !!inFav,
      readLater: !!inReadLater,
      alreadyRead: !!inAlreadyRead,
    });
  }, [comic, user]);

  // 🔁 3. Load comments for this comic
  useEffect(() => {
    if (!id) return;

    async function loadComments() {
      try {
        setCommentsLoading(true);
        const res = await axios.get(`/api/comics/${id}/comments`);
        setComments(res.data.data || []);
      } catch (err) {
        console.error("Load comments error:", err);
        toast.error("Could not load comments.");
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [id]);

  // 🧩 Build payload for shelves API from current comic
  function buildShelfPayload(c: Comic) {
    return {
      volumeId: String(c.id),
      title: c.title,
      coverUrl: c.cover,
      publisher: c.author ?? "",
      year: c.year ? String(c.year) : "",
    };
  }

  // ⭐📚✅ TOGGLE helper: add if not present, remove if present
  async function toggleShelf(shelf: ShelfKey) {
    if (!comic) return;

    const isOnShelf = shelves[shelf];
    const volumeId = String(comic.id);

    try {
      if (isOnShelf) {
        // already there → REMOVE
        await axios.delete("/api/users/shelves", {
          data: { shelf, volumeId },
        });

        toast.success(
          shelf === "favorites"
            ? "Removed from Favorites"
            : shelf === "readLater"
            ? "Removed from Read Later"
            : "Removed from Already Read"
        );
      } else {
        // not there yet → ADD
        await axios.post("/api/users/shelves", {
          shelf,
          comic: buildShelfPayload(comic),
        });

        toast.success(
          shelf === "favorites"
            ? "Added to Favorites!"
            : shelf === "readLater"
            ? "Saved to Read Later!"
            : "Marked as Already Read!"
        );
      }

      // pull fresh user data so other views (profile shelves) stay in sync
      await refreshUser();

      // flip local state
      setShelves((prev) => ({
        ...prev,
        [shelf]: !prev[shelf],
      }));
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        status === 401
          ? "Please log in to manage your shelves."
          : err?.response?.data?.message || "Could not update your shelf.";
      toast.error(msg);
      console.error("toggleShelf error:", err);
    }
  }

  // ➕ Post a new comment
  async function handlePostComment() {
    if (!comic || !id) return;
    if (!user) {
      toast.error("Please log in to comment.");
      return;
    }

    const text = newComment.trim();
    if (!text) return;

    try {
      setPostingComment(true);
      const res = await axios.post(`/api/comics/${id}/comments`, { text });
      const created: Comment = res.data.data;

      // add at top
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch (err: any) {
      console.error("Post comment error:", err);
      const msg = err?.response?.data?.message || "Could not post comment.";
      toast.error(msg);
    } finally {
      setPostingComment(false);
    }
  }

  // 👍 Toggle like for a comment
  async function toggleLike(commentId: string) {
    if (!user) {
      toast.error("Please log in to like comments.");
      return;
    }

    // optimistic UI update
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const liked = c.likes.includes(user._id);
        const newLikes = liked
          ? c.likes.filter((id) => id !== user._id)
          : [...c.likes, user._id];
        return { ...c, likes: newLikes };
      })
    );

    try {
      await axios.post(`/api/comments/${commentId}/like`);
    } catch (err) {
      console.error("Like comment error:", err);
      toast.error("Could not update like.");

      // revert if failed
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== commentId) return c;
          const liked = c.likes.includes(user._id!);
          const newLikes = liked
            ? c.likes.filter((id) => id !== user._id)
            : [...c.likes, user._id!];
          return { ...c, likes: newLikes };
        })
      );
    }
  }

  // 🗑 Delete a comment (TOP-LEVEL function, not nested)
  async function handleDeleteComment(commentId: string) {
    if (!user) {
      toast.error("Please log in to delete comments.");
      return;
    }

    const sure = window.confirm("Delete this comment?");
    if (!sure) return;

    try {
      await axios.delete(`/api/comments/${commentId}`);
      // remove it from local state
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted.");
    } catch (err: any) {
      console.error("Delete comment error:", err);
      const msg = err?.response?.data?.message || "Could not delete comment.";
      toast.error(msg);
    }
  }

  if (!id) return <p>Invalid comic ID.</p>;
  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;
  if (!comic) return <p>Comic not found.</p>;

  return (
    <>
      <main className={styles.detailPage}>
        <ComicCard comic={comic} fullDetail />

      {/* 🧺 Shelf actions row (toggles) */}
      <div className={styles.actionsRow}>
        {/* Favorites */}
        <button
          type="button"
          className={styles.shelfButton}
          disabled={checkingShelves}
          onClick={() =>
            user ? toggleShelf("favorites") : setShowAuthModal(true)
          }
        >
          {shelves.favorites ? "★ Remove from Favorites" : "★ Add to Favorites"}
        </button>

        {/* Read Later */}
        <button
          type="button"
          className={styles.shelfButton}
          disabled={checkingShelves}
          onClick={() =>
            user ? toggleShelf("readLater") : setShowAuthModal(true)
          }
        >
          {shelves.readLater ? "📚 Remove from Read Later" : "📚 Read Later"}
        </button>

        {/* Already Read */}
        <button
          type="button"
          className={styles.shelfButton}
          disabled={checkingShelves}
          onClick={() =>
            user ? toggleShelf("alreadyRead") : setShowAuthModal(true)
          }
        >
          {shelves.alreadyRead
            ? "✅ Remove from Already Read"
            : "✅ Mark as Read"}
        </button>
      </div>

      {/* 💬 Comments */}
      <section className={styles.commentsSection}>
        <div className={styles.commentsHeader}>
          <h2>Comments</h2>
          {commentsLoading && (
            <span className={styles.smallText}>Loading…</span>
          )}
        </div>

        {/* New comment form */}
        {user ? (
          <div className={styles.commentForm}>
            <textarea
              className={styles.commentTextarea}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this comic..."
              rows={3}
            />
            <button
              type="button"
              className={styles.commentSubmit}
              disabled={postingComment || !newComment.trim()}
              onClick={handlePostComment}
            >
              {postingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        ) : (
          <p className={styles.loginHint}>
            Log in to leave a comment and like others.
          </p>
        )}

        {/* Comment list */}
        {comments.length === 0 && !commentsLoading ? (
          <p className={styles.noComments}>No comments yet. Be the first!</p>
        ) : (
          <ul className={styles.commentList}>
            {comments.map((c) => {
              const likedByMe = user ? c.likes.includes(user._id) : false;
              const likesCount = c.likes.length;

              // ✅ can delete if you’re the author (by id) or same username
              const canDelete =
                !!user && (c.user === user._id || c.username === user.username);

              return (
                <li key={c._id} className={styles.commentItem}>
                  <div className={styles.commentHeaderRow}>
                    <span className={styles.commentAuthor}>{c.username}</span>

                    <div className={styles.commentActions}>
                      <button
                        type="button"
                        className={styles.likeButton}
                        onClick={() => toggleLike(c._id)}
                      >
                        {likedByMe ? "❤️‍🔥" : "🤍"} {likesCount || ""}
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handleDeleteComment(c._id)}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={styles.commentText}>{c.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      </main>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
