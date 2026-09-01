import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { PublicPost } from '@/lib/posts/types';
import NewsCard from './NewsCard';

vi.mock('next/link', () => ({ default: (props: ComponentProps<'a'>) => createElement('a', props) }));
vi.mock('next/image', () => ({ default: ({ src, alt, sizes, className, style }: ComponentProps<'img'>) => createElement('img', { src, alt, sizes, className, style }) }));

const post: PublicPost = {
  id: 'card-test', slug: 'berita-pengujian', title: 'Berita pengujian kartu',
  excerpt: '', category: 'Berita', tags: [], thumbnail: null, authorName: 'Redaksi',
  sourceTitle: null, sourceUrl: null, seoTitle: null, seoDescription: null,
  publishedAt: '2026-08-24T00:00:00Z', createdAt: '2026-08-24T00:00:00Z',
  updatedAt: '2026-08-24T00:00:00Z', firstPublishedAt: '2026-08-24T00:00:00Z', blocks: [],
};

describe('NewsCard', () => {
  it('keeps the article link, full title, date and fallback without a thumbnail', () => {
    const title = 'Judul artikel yang sangat panjang '.repeat(8).trim();
    const html = renderToStaticMarkup(createElement(NewsCard, { post: { ...post, title } }));
    expect(html).toContain('href="/post/berita-pengujian"');
    expect(html).toContain(title);
    expect(html).toContain('aria-labelledby="home-post-card-test"');
    expect(html).toContain('dateTime="2026-08-24T00:00:00Z"');
    expect(html).toContain('Warta PCNU Bolsel');
    expect(html).not.toContain('<img');
  });

  it('renders the thumbnail with responsive source sizing', () => {
    const html = renderToStaticMarkup(createElement(NewsCard, { post: { ...post, thumbnail: '/photo.jpg' } }));
    expect(html).toContain('src="/photo.jpg"');
    expect(html).toContain('sizes="');
    expect(html).toContain('object-fit:contain');
    expect(html).not.toContain('Warta PCNU Bolsel');
  });

  it('renders a plain-text excerpt instead of injecting article markup', () => {
    const html = renderToStaticMarkup(createElement(NewsCard, { post: { ...post, blocks: [{ id: 'body', type: 'text', content: '<p>Ringkasan <strong>berita</strong></p>' }] } }));
    expect(html).toContain('Ringkasan berita');
    expect(html).not.toContain('<strong>');
  });
});
