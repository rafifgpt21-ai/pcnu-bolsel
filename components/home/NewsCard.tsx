import Image from 'next/image';
import Link from 'next/link';
import type { PublicPost } from '@/lib/posts/types';
import styles from './NewsCard.module.css';

export default function NewsCard({ post }: { post: PublicPost }) {
  const firstTextBlock = post.blocks.find((block) => block.type === 'text');
  const plainContent = firstTextBlock?.content?.replace(/<[^>]*>?/gm, '') || '';
  const snippet = plainContent.slice(0, 160) + (plainContent.length > 160 ? '…' : '');
  const titleId = `home-post-${post.id}`;

  return (
    <article className={styles.shell}>
      <Link href={`/post/${post.slug}`} aria-labelledby={titleId} className={styles.card}>
        <div className={styles.media}>
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) calc(50vw - 112px), (min-width: 700px) calc(50vw - 60px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)"
              className={styles.image}
              style={{ objectFit: 'contain' }}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>
              <span aria-hidden="true" className="material-symbols-outlined">newspaper</span>
              <span>Warta PCNU Bolsel</span>
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.metadata}>
            <span className={styles.category}><span aria-hidden="true" />{post.category}</span>
            <time className={styles.date} dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>
          <h3 id={titleId} className={styles.title}>{post.title}</h3>
          {snippet && <p className={styles.excerpt}>{snippet}</p>}

          <div className={styles.footer}>
            <span className={styles.cta}>Baca selengkapnya<span aria-hidden="true" className={`material-symbols-outlined ${styles.arrow}`}>arrow_forward</span></span>
          </div>
        </div>
      </Link>
    </article>
  );
}
