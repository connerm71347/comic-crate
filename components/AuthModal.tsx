"use client";

import { useState } from "react";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  function handleClose() {
    setMode("login"); // reset to login when closing
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "login" ? "Login" : "Sign Up"}
    >
      {mode === "login" ? (
        <LoginForm
          onSuccess={handleClose}
          onSwitchToSignup={() => setMode("signup")}
        />
      ) : (
        <SignupForm
          switchToLogin={() => setMode("login")}
          onSuccess={handleClose}
        />
      )}
    </Modal>
  );
}
