// components/Header.tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import AuthModal from "@/components/AuthModal";
import SearchBar from "./SearchBar";
import styles from "@/app/layout.module.css";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  // ✅ use global auth state
  const { user, loading, refreshUser } = useAuth();

  async function handleLogout() {
    try {
      await axios.get("/api/users/logout");
      await refreshUser(); // 🔥 tell context "we're logged out now"
      router.push("/");
    } catch (err) {
      console.error("Logout error", err);
    }
  }

  return (
    <>
      <header className={styles.rootHeader}>
        <nav className={styles.navContainer}>
          {/* LEFT: logo + links */}
          <div className={styles.leftSide}>
            <Link href="/">
              <h1 className={styles.title}>Comic Crate</h1>
            </Link>

            <div className={styles.navLinks}>
              <Link href="/">Home</Link>
              <Link href="/browse">Browse</Link>

              {/* 🔐 Auth-aware area */}
              {!loading && (
                <>
                  {user ? (
                    <>
                      {/* Logged IN */}
                      <Link href="/profile">Profile</Link>
                      <button
                        type="button"
                        className={styles.navButton}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Logged OUT */}
                      <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => setShowAuth(true)}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => setShowAuth(true)}
                      >
                        Profile
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: search bar */}
          <div className={styles.rightSide}>
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* Auth modal */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
