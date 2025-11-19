/// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import ComicCard from "@/components/ComicCard";
import Loader from "@/components/Loader";
import styles from "./ProfilePage.module.css";

type ShelfKey = "favorites" | "readLater" | "alreadyRead";

type ShelfItem = {
  volumeId: string;
  title?: string;
  coverUrl?: string;
  publisher?: string;
  year?: string;
};

// avatar catalog - in the futrue, could use real images from /public or a CDN
const AVATARS = [
  { key: "spidey", label: "Spidey", emoji: "🕷️" },
  { key: "bats", label: "Dark Knight", emoji: "🦇" },
  { key: "supes", label: "Super!", emoji: "🦸‍♂️" },
  { key: "xmen", label: "Mutant", emoji: "❌" },
  { key: "magi", label: "Mystic", emoji: "🔮" },
  { key: "smile", label: "Classic", emoji: "😎" },
];

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();

  // profile edit fields
  const [bio, setBio] = useState("");
  const [favoriteHero, setFavoriteHero] = useState("");
  const [favoriteComic, setFavoriteComic] = useState("");
  const [avatarKey, setAvatarKey] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // shelves tab
  const [activeShelf, setActiveShelf] = useState<ShelfKey>("favorites");

  // when user loads / changes, sync local form fields
  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setFavoriteHero(user.favoriteHero ?? "");
    setFavoriteComic(user.favoriteComic ?? "");
    setAvatarKey(user.avatarKey ?? "");
  }, [user]);

  async function handleSaveProfile() {
    try {
      setSaving(true);
      await axios.patch("/api/users/profile", {
        bio,
        favoriteHero,
        favoriteComic,
        avatarKey,
      });
      toast.success("Profile updated!");
      await refreshUser(); // pull fresh data into context + header
    } catch (err: any) {
      console.error("Profile update error:", err);
      const msg = err?.response?.data?.message || "Could not update profile.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-3xl font-bold">You&apos;re not logged in</h1>
        <p>Use the Login button in the header to access your profile.</p>
      </div>
    );
  }

  // shelves from user (make sure your /api/users/me returns these arrays)
  const shelves = {
    favorites: (user.favorites ?? []) as ShelfItem[],
    readLater: (user.readLater ?? []) as ShelfItem[],
    alreadyRead: (user.alreadyRead ?? []) as ShelfItem[],
  };

  const activeList = shelves[activeShelf];

  return (
    <main className={styles.profilePage}>
      <section className={styles.topSection}>
        <div className={styles.identityCard}>
          <div className={styles.avatar}>
            {AVATARS.find((opt) => opt.key === avatarKey)?.emoji ||
              user.username?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>
          <div className={styles.identityText}>
            <h1>{user.username}</h1>
            <p>{user.email}</p>
          </div>
          <div className={styles.avatarOptions}>
            {AVATARS.map((avatar) => (
              <button
                type="button"
                key={avatar.key}
                className={`${styles.avatarChip} ${
                  avatarKey === avatar.key ? styles.avatarChipActive : ""
                }`}
                onClick={() => setAvatarKey(avatar.key)}
              >
                <span>{avatar.emoji}</span>
                <small>{avatar.label}</small>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about your comic tastes..."
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Favorite Hero</label>
              <input
                className={styles.input}
                value={favoriteHero}
                onChange={(e) => setFavoriteHero(e.target.value)}
                placeholder="e.g. Spider-Man, Batman, Storm…"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Favorite Comic / Series</label>
              <input
                className={styles.input}
                value={favoriteComic}
                onChange={(e) => setFavoriteComic(e.target.value)}
                placeholder="e.g. The Sandman, Saga, X-Men…"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>

      <section className={styles.shelvesSection}>
        <div className={styles.shelvesHeader}>
          <h2>Your Shelves</h2>
        </div>

        <div className={styles.tabs}>
          {(
            [
              ["favorites", "Favorites"],
              ["readLater", "Read Later"],
              ["alreadyRead", "Already Read"],
            ] as [ShelfKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveShelf(key)}
              className={`${styles.tabButton} ${
                activeShelf === key ? styles.tabButtonActive : ""
              }`}
            >
              {label}
              {shelves[key].length ? ` (${shelves[key].length})` : ""}
            </button>
          ))}
        </div>

        {activeList.length === 0 ? (
          <p className={styles.emptyState}>
            Nothing here yet. Go to a comic detail page and use the buttons to
            add it to <strong>{activeShelf}</strong>.
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {activeList.map((item) => (
              <ComicCard
                key={item.volumeId}
                comic={{
                  id: item.volumeId,
                  title: item.title || "Untitled",
                  author: item.publisher || "—",
                  cover: item.coverUrl || "",
                  year: item.year ? Number(item.year) : 0,
                  description: "",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
