"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      console.log("Login response", response.data);
      toast.success("Login successful");
      router.push("/profile");
    } catch (error) {
      console.log("Login error", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Login failed. Please try again."
        : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <hr />
      <label htmlFor="email">Email</label>
      <input
        className={styles.emailInput}
        type="email"
        id="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />
      <label htmlFor="password">Password</label>
      <input
        className={styles.passwordInput}
        type="password"
        id="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="Password"
      />
      <button
        className={styles.loginButton}
        onClick={onLogin}
        disabled={buttonDisabled}
      >
        {buttonDisabled ? "Fill all fields" : "Login"}
      </button>
      <Link href="/signup" className={styles.signupLink}>
        Don&apos;t have an account? Sign Up
      </Link>
    </div>
  );
}
