"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

type Props = {
  initialAlreadyLit: boolean;
};

export default function PhotoFlameBadge({ initialAlreadyLit }: Props) {
  const [isLit, setIsLit] = useState(initialAlreadyLit);
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    function handleCandleLit() {
      setIsLit(true);
      setIsBursting(true);

      const timeout = window.setTimeout(() => {
        setIsBursting(false);
      }, 1400);

      return () => window.clearTimeout(timeout);
    }

    window.addEventListener("memorial:candle-lit", handleCandleLit);

    return () => {
      window.removeEventListener("memorial:candle-lit", handleCandleLit);
    };
  }, []);

  return (
    <>
      {isBursting ? (
        <div className={styles.flameBurst} aria-hidden="true">
          <div className={styles.flameShape}>
            <span className={styles.flameGlow}></span>
            <span className={styles.flameOuter}></span>
            <span className={styles.flameInner}></span>
          </div>
        </div>
      ) : null}

      {isLit ? (
        <div className={styles.photoFlameBadge} aria-hidden="true">
          <div className={styles.photoFlameHalo}></div>
          <div className={styles.photoFlameIcon}>
            <span className={styles.photoFlameOuter}></span>
            <span className={styles.photoFlameInner}></span>
          </div>
        </div>
      ) : null}
    </>
  );
}