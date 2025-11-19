// app/not-found.tsx
"use client"; // 👈 ADD THIS

import { useRouter } from "next/navigation";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.imageSection}>
        <img
          src="https://i.pinimg.com/736x/69/2d/ec/692dec6b43ca010ea23fcf297e1120ec.jpg"
          alt="funny 404"
        />
      </div>

      <div className={styles.textSection}>
        <h2>404: Not Fou-Yikes!!!</h2>
        <p>
          Congrats! You found the one page even the developers pretend doesn’t
          exist.
          <br />
          Now, before you go pushing that giant red button— DON’T. (I mean…
          unless you really want to see what happens.)
        </p>

        <button
          className={styles.redButton}
          onClick={() => router.push("/")} // ✅ nicer than window.location
        >
          DO NOT PUSH
        </button>
      </div>
    </div>
  );
}
