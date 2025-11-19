"use client"; // ✅ now this component can use onClick, useState, etc.

import Image from "next/image";
import Link from "next/link";
import styles from "./ComicCard.module.css";

type Comic = {
  id: number | string;
  title: string;
  author?: string;
  cover: string;
  year?: number;
  description?: string;
};

export default function ComicCard({
  comic,
  fullDetail = false,
}: {
  comic: Comic;
  fullDetail?: boolean;
}) {
  // example: a local click handler lives HERE (not passed from parent)
  function handleAdd() {
    // call your API to save favorite, etc.
    console.log("Add to Collection", comic.id);
  }

  // ... render as you had it ...
  return fullDetail ? (
    <div className={styles.comicDetailContainer}>
      <div className={styles.detailImage}>
        <Image
          className={styles.comicImage}
          src={comic.cover}
          alt={comic.title}
          width={480}
          height={720}
          priority
          unoptimized
        />
      </div>
      <div className={styles.detailInfo}>
        <h2>{comic.title}</h2>
        {comic.author && (
          <p>
            <strong>Author/Publisher:</strong> {comic.author}
          </p>
        )}
        {comic.year ? (
          <p>
            <strong>Year:</strong> {comic.year}
          </p>
        ) : null}
        {comic.description && <p>{comic.description}</p>}
        {/* <button className={styles.addButton} onClick={handleAdd}>
          Add to Collection
        </button>
        reviews... */}
      </div>
    </div>
  ) : (
    <div className={styles.comicCard}>
      <Link href={`/comics/${comic.id}`} className={styles.cardLink}>
        <div className={styles.thumbWrap}>
          <Image
            className={styles.thumbImage}
            src={comic.cover}
            alt={comic.title}
            width={260}
            height={390}
            unoptimized
          />
        </div>
        <h3>{comic.title}</h3>
      </Link>
    </div>
  );
}
