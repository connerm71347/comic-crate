// contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

type User = {
  alreadyRead: never[];
  readLater: never[];
  favorites: never[];
  favoriteComic: string;
  favoriteHero: string;
  bio: string;
  avatarKey?: string;
  _id: string;
  username: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      setLoading(true);
      const res = await axios.get("/api/users/me");
      setUser(res.data.data ?? null);
    } catch {
      // not logged in or error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
