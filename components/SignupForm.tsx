"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./AuthForm.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupForm({
  switchToLogin,
  onSuccess,
}: {
  switchToLogin: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setDisabled(!(user.email && user.password && user.username));
  }, [user]);

  async function onSignup() {
    try {
      setLoading(true);
      setError("");

      // 1) Create account
      await axios.post("/api/users/signup", user);

      // 2) Auto-login
      await axios.post("/api/users/login", {
        email: user.email,
        password: user.password,
      });

      // 3) Refresh auth context
      await refreshUser();

      toast.success("Welcome to Comic Crate!");

      // 4) Close modal + go to profile
      onSuccess?.();
      router.push("/profile");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      if (serverMessage === "User already exists") {
        setError("Looks like that email is already registered. Please log in.");
      } else if (serverMessage === "Username already taken") {
        setError("That username is taken. Try another one.");
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error("Signup/Login error:", err);
      toast.error(serverMessage || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <hr />

      <div className={styles.form}>

        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        <button
          className={styles.button}
          disabled={disabled || loading}
          onClick={onSignup}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.switchText}>
          Already have an account?
          <button
            type="button"
            className={styles.switchLink}
            onClick={switchToLogin}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
