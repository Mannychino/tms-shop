import Image from 'next/image';
import styles from './hero.module.css';

export function Hero() {
  return (
    <header
      id="home"
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.imageFrame}>
        <Image
          src="/assets/redesign/hero-community.png"
          alt="Three models wearing green and pink community jerseys"
          fill
          sizes="(min-width: 1440px) 1440px, 100vw"
          preload
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>The Merch Shop</p>

        <h1 id="hero-title" className={styles.title}>
          MADE FOR YOUR COMMUNITY.
        </h1>

        <a href="#shop" className={styles.button}>
          Shop the collection
        </a>
      </div>
    </header>
  );
}