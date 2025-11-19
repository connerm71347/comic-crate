// components/LoginForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import styles from "./AuthForm.module.css";
import { useAuth } from "@/contexts/AuthContext";

type LoginFormProps = {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
};

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: LoginFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [user, setUser] = useState({ email: "", password: "" });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
    setErrorMsg("");
  }, [user]);

  async function onLogin() {
    try {
      setLoading(true);
      setErrorMsg("");

      await axios.post("/api/users/login", user);

      //  update global auth state
      await refreshUser();

      toast.success("Login successful");

      onSuccess?.(); // close modal
      router.push("/profile");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Login failed. Please try again."
        : "Login failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <hr />

      <div className={styles.form}>
        <label htmlFor="email">Email</label>
        <input
          className={styles.input}
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          type="email"
          id="email"
          placeholder="Email"
        />

        <label htmlFor="password">Password</label>
        <input
          className={styles.input}
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          type="password"
          id="password"
          placeholder="Password"
        />

        <button
          onClick={onLogin}
          disabled={buttonDisabled}
          className={styles.button}
        >
          {buttonDisabled ? "Fill all fields" : "Login"}
        </button>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        <p className={styles.switchText}>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToSignup}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
