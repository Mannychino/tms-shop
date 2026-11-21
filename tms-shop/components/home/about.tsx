import Image from 'next/image';
import styles from './about.module.css';

export function About() {
  return (
    <section
      id="about"
      className={styles.section}
      aria-labelledby="about-title"
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>01 / About TMS</p>

            <h2 id="about-title" className={styles.title}>
              MADE FOR PEOPLE.
              <br />
              BUILT AROUND COMMUNITY.
            </h2>

            <div className={styles.description}>
              <p>
                TMS is a Nigeria-based culture and merchandise studio
                creating clothing, accessories and experiences for
                communities.
              </p>

              <p>
                Rooted in the Solana ecosystem, we turn shared ideas
                into pieces people can wear, collect and connect through.
              </p>
            </div>

            <div className={styles.actions}>
              <a href="#process" className={styles.primaryLink}>
                Create with TMS
              </a>

              <a href="#shop" className={styles.secondaryLink}>
                Explore the collection
              </a>
            </div>
          </div>

          <div className={styles.imageFrame}>
            <Image
              src="/assets/redesign/about-community.jpg"
              alt="Four mannequins styled in black Solana Summit T-shirts"
              fill
              sizes="(max-width: 800px) 100vw, (max-width: 1440px) 50vw, 600px"
              className={styles.image}
            />
          </div>
        </div>

        <ul className={styles.features} aria-label="What we create">
          <li>CUSTOM MERCH</li>
          <li>COMMUNITY DROPS</li>
          <li>EVERYDAY ESSENTIALS</li>
        </ul>
      </div>
    </section>
  );
}