"use client";

import Link from 'next/link';
import { Post } from "@/app/generated/prisma/client";

interface ArchiveCardProps {
  post: Post;
}

export default function ArchiveCard({ post }: ArchiveCardProps) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/15 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Thumbnail or accent bar */}
      {post.thumbnail ? (
        <div className="aspect-video overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={post.title}
            src={post.thumbnail}
          />
        </div>
      ) : (
        <div className="h-2 bg-linear-to-r from-secondary to-primary-container"></div>
      )}
      <div className="p-6 flex flex-col grow">
        <span className="text-secondary font-label text-[10px] font-bold tracking-widest uppercase mb-2 block">
          {post.category}
        </span>
        <h3 className="font-headline font-bold text-lg text-primary mb-3 leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
          {post.title}
        </h3>
        
        {/* Placeholder for excerpt if exists in data, otherwise just date */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="text-on-surface-variant text-xs">
            {new Date(post.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <div className="inline-flex items-center text-secondary font-bold text-xs gap-1 group-hover:gap-2 transition-all">
            Baca
            <span className="material-symbols-outlined text-[16px]">east</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
