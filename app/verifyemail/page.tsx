"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setverified] = useState(false);
  const [error, setError] = useState(false);

  const verifyEmail = async (tokenValue: string) => {
    try {
      await axios.post("/api/users/verifyemail", { token: tokenValue });
      setverified(true);
    } catch (error) {
      setError(true);
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const urlToken = window.location.search.split("token=")[1];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(urlToken || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      verifyEmail(token);
    }
  }, [token]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl">Verify Email</h1>
      <h2 className="p-2 bg-blue-500 text-black ">
        {token ? token : "no token"}
      </h2>
      {verified && (
        <div>
          <h2 className="text-2xl">Email Verified</h2>
          <Link href="/login" className="text-blue-500 underline">
            Go to Login
          </Link>
        </div>
      )}
      {error && (
        <div>
          <h2 className="text-2xl text-red-500">Verification Failed</h2>
          <Link href="/signup" className="text-blue-500 underline">
            Go to Signup
          </Link>
        </div>
      )}
    </div>
  );
}
