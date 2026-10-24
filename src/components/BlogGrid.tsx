import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera,
  Maximize2,
  QrCode,
  FileArchive,
  Layers,
  FileText,
  Lock,
  Unlock,
  Stamp,
  Eraser,
  FileDown,
  ScanText,
  ArrowRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { BlogItem } from '@/lib/blogsData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Maximize2,
  QrCode,
  FileArchive,
  Layers,
  FileText,
  Lock,
  Unlock,
  Stamp,
  Eraser,
  FileDown,
  ScanText,
};

interface BlogGridProps {
  blogs: BlogItem[];
}

export default function BlogGrid({ blogs }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => {
        const IconComponent = iconMap[blog.icon] || FileText;

        return (
          <article
            key={blog.id}
            className="glass-card p-6 sm:p-7 h-full flex flex-col justify-between rounded-3xl border border-white/80 dark:border-zinc-800/80 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 group"
          >
            <div>
              {/* Top Meta Row */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                  {blog.category}
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.readTime}
                </span>
              </div>

              {/* Thumbnail or Vector Illustration Glow Box */}
              {blog.thumbnail ? (
                <div
                  className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md group-hover:scale-[1.02] transition-transform duration-300 bg-zinc-950"
                  style={{ aspectRatio: '16 / 9' }}
                >
                  <Image
                    src={blog.thumbnail}
                    alt={blog.title}
                    width={800}
                    height={450}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative mb-5 inline-block">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${blog.accentColor} border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-brand-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              )}

              {/* H3 Title */}
              <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-900 dark:text-white mb-2.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
              </h3>

              {/* 2-Line Summary */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-2">
                {blog.excerpt}
              </p>
            </div>

            {/* Card Actions */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
              <Link
                href={`/blog/${blog.slug}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:underline cursor-pointer"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={blog.toolPath}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-brand-500/10 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-300 transition-all border border-transparent hover:border-brand-500/20 cursor-pointer"
              >
                <span>Try Tool</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
