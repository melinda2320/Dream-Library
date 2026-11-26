import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Book } from '../types/library.ts';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
}

const TONE_STYLES: Record<
  Book['coverTone'],
  { bg: string; border: string; title: string; muted: string; rule: string }
> = {
  ivory: {
    bg: 'bg-[#F3EFE6]',
    border: 'border-[#DDD6C7]',
    title: 'text-[#1C1917]',
    muted: 'text-[#57534E]',
    rule: 'border-[#C8BFA9]'
  },
  lapis: {
    bg: 'bg-[#1A314D]',
    border: 'border-[#12243A]',
    title: 'text-[#F8F6F1]',
    muted: 'text-[#CBD5E1]',
    rule: 'border-[#395578]'
  },
  forest: {
    bg: 'bg-[#1D3B2A]',
    border: 'border-[#132A1D]',
    title: 'text-[#F6F4EE]',
    muted: 'text-[#C6D5CC]',
    rule: 'border-[#385B47]'
  },
  terracotta: {
    bg: 'bg-[#7A2E1D]',
    border: 'border-[#5F2214]',
    title: 'text-[#FAF6F0]',
    muted: 'text-[#E7D0C9]',
    rule: 'border-[#9B4B38]'
  },
  charcoal: {
    bg: 'bg-[#262422]',
    border: 'border-[#171614]',
    title: 'text-[#F5F2EB]',
    muted: 'text-[#C5BFB6]',
    rule: 'border-[#45413C]'
  },
  stone: {
    bg: 'bg-[#E8E2D5]',
    border: 'border-[#D2C9B8]',
    title: 'text-[#1C1917]',
    muted: 'text-[#57534E]',
    rule: 'border-[#BFB49F]'
  }
};

export function BookCover({ book, size = 'md' }: BookCoverProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const tone = TONE_STYLES[book.coverTone] ?? TONE_STYLES.ivory;

  const sizeClass =
    size === 'sm'
      ? 'w-16 h-22'
      : size === 'lg'
        ? 'w-full aspect-[3/4]'
        : 'w-full aspect-[3/4]';

  if (book.coverImage && !imgFailed) {
    return (
      <div className={`${sizeClass} overflow-hidden rounded-sm border border-[#E2DDD3] bg-[#EFECE4]`}>
        <img
          src={book.coverImage}
          alt={`Sampul ${book.title}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${tone.bg} ${tone.border} relative flex flex-col justify-between overflow-hidden rounded-sm border p-4 select-none`}
    >
      <div className={`border-b ${tone.rule} pb-2`}>
        <p
          className={`font-mono text-[10px] tracking-wider uppercase truncate ${tone.muted}`}
        >
          {size === 'sm' ? book.format : `${book.callNumber}`}
        </p>
      </div>

      <div className="my-auto py-2">
        <p
          className={`font-display font-semibold leading-snug ${
            size === 'sm' ? 'text-[10px] line-clamp-2' : size === 'lg' ? 'text-xl' : 'text-base line-clamp-3'
          } ${tone.title}`}
        >
          {book.title}
        </p>
        {size !== 'sm' && (
          <p className={`mt-2 text-xs leading-relaxed line-clamp-2 ${tone.muted}`}>
            {book.author}
          </p>
        )}
      </div>

      <div className={`flex items-center justify-between border-t ${tone.rule} pt-2`}>
        <span className={`text-[10px] tracking-wide truncate ${tone.muted}`}>
          {size === 'sm' ? String(book.year) : book.publisher}
        </span>
        {size !== 'sm' && <BookOpen className={`h-3.5 w-3.5 shrink-0 ${tone.muted}`} />}
      </div>
    </div>
  );
}
