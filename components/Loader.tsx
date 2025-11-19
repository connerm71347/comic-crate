import { useEffect, useState } from "react";
import styles from "./Loader.module.css";

const funMessages = [
  "Flipping through the pages… 📖",
  "Spinning up your superpowers… ⚡",
  "Loading… faster than a speeding bullet! 🦸‍♂️",
  "Summoning your comics from the multiverse… 🌌",
  "Penciling in some epic adventures… ✏️",
  "Inking your next favorite story… 🖋️",
  "Assembling heroes… one panel at a time… 🦸‍♀️",
];

const Loader = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funMessages.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(funMessages[randomIndex]);
  }, []);

  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
};

export default Loader;
