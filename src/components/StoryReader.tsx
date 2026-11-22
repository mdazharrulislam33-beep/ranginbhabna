import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Palette,
  Minus,
  Plus,
} from 'lucide-react';
import { MonetizationSettings, ReaderTheme, Story, StoryComment } from '../types';
import { getCategoryInfo } from '../data/stories';
import {
  estimateReadTime,
  formatBengaliDate,
  makeFallbackCoverSvg,
  toBengaliNumber,
} from '../utils/bengali';
import { StoryCard } from './StoryCard';
import { ReaderSupportCard, SponsorAdBanner } from './MonetizationWidgets';

interface StoryReaderProps {
  story: Story;
  allStories: Story[];
  isLiked: boolean;
  isFavorited: boolean;
  likedIds: string[];
  favoriteIds: string[];
  comments: Record<string, StoryComment[]>;
  monetization: MonetizationSettings;
  onBack: () => void;
  onOpenStory: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShareStory: (id: string) => void;
  onAdClick: () => void;
  onAddComment: (storyId: string, author: string, text: string) => void;
  onNotify: (msg: string) => void;
}

const THEME_CONFIG: Record<ReaderTheme, { bg: string; text: string; name: string }> = {
  paper: { bg: 'bg-white', text: 'text-[#241726]', name: 'শুভ্র সাদা' },
  warm: { bg: 'bg-[#FAF4E8]', text: 'text-[#312418]', name: 'উষ্ণ কাগজ' },
  blush: { bg: 'bg-[#FDF4F8]', text: 'text-[#281629]', name: 'গোলাপি আভা' },
};

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  allStories,
  isLiked,
  isFavorited,
  likedIds,
  favoriteIds,
  comments,
  monetization,
  onBack,
  onOpenStory,
  onToggleLike,
  onToggleFavorite,
  onShareStory,
  onAdClick,
  onAddComment,
  onNotify,
}) => {
  const [fontSize, setFontSize] = useState<number>(1.18);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('paper');
  const [progress, setProgress] = useState<number>(0);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [story.id, story.image]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [story.id]);

  const cat = getCategoryInfo(story.category);
  const storyComments = comments[story.id] ?? [];
  const paragraphs = story.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const relatedStories = allStories
    .filter((s) => s.status === 'published' && s.id !== story.id && s.category === story.category)
    .slice(0, 2);

  const coverSrc =
    imgError || !story.image
      ? makeFallbackCoverSvg(story.title, '#FBCFE8', cat.accentHex)
      : story.image;

  const cycleTheme = () => {
    const order: ReaderTheme[] = ['paper', 'warm', 'blush'];
    const next = order[(order.indexOf(readerTheme) + 1) % order.length];
    setReaderTheme(next);
    onNotify(`পড়ার থিম: ${THEME_CONFIG[next].name}`);
  };

  const shareUrl = `${window.location.href.split('#')[0]}#story=${story.id}`;
  const shareText = `রঙিন ভাবনায় পড়ুন "${story.title}" — লেখক: ${story.author}`;

  const handleNativeOrCopyShare = async () => {
    onShareStory(story.id);
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: shareText, url: shareUrl });
        return;
      } catch {
        // Fallback to clipboard below
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
        onNotify('গল্পের লিংক কপি করা হয়েছে');
        return;
      } catch {
        // Fallback
      }
    }
    onNotify(`গল্প: ${story.title}`);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const author = commentAuthor.trim();
    const text = commentText.trim();
    if (!author || !text) return;
    onAddComment(story.id, author, text);
    setCommentAuthor('');
    setCommentText('');
  };

  const themeStyle = THEME_CONFIG[readerTheme];

  return (
    <>
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#9D174D] z-50 transition-[width] duration-100"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="পাঠের অগ্রগতি"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article
          className={`${themeStyle.bg} ${themeStyle.text} border border-[#EADEE4] rounded-2xl p-5 sm:p-10 transition-colors duration-300`}
        >
          {/* Reader Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#EADEE4]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#EADEE4] bg-white/80 text-sm font-semibold text-[#241726] hover:bg-[#FDF2F8] transition-colors cursor-pointer min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>গল্পের পাতায় ফিরুন</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.max(0.98, +(s - 0.1).toFixed(2)))}
                title="লেখা ছোট করুন"
                aria-label="লেখা ছোট করুন"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#EADEE4] bg-white/80 text-xs font-semibold text-[#241726] hover:bg-[#FDF2F8] cursor-pointer min-h-[40px]"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>অ</span>
              </button>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(1.55, +(s + 0.1).toFixed(2)))}
                title="লেখা বড় করুন"
                aria-label="লেখা বড় করুন"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#EADEE4] bg-white/80 text-xs font-semibold text-[#241726] hover:bg-[#FDF2F8] cursor-pointer min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>অ</span>
              </button>
              <button
                type="button"
                onClick={cycleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EADEE4] bg-white/80 text-xs font-semibold text-[#241726] hover:bg-[#FDF2F8] cursor-pointer min-h-[40px] whitespace-nowrap"
              >
                <Palette className="w-3.5 h-3.5" aria-hidden="true" />
                <span>থিম: {themeStyle.name}</span>
              </button>
            </div>
          </div>

          {/* Editorial Header */}
          <header className="max-w-[68ch] mx-auto mb-8">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold mb-3">
              <span style={{ color: cat.accentHex }}>{cat.label}</span>
              <span aria-hidden="true" className="text-[#C8B2BE]">·</span>
              <span className="text-[#6B5368] font-normal">{formatBengaliDate(story.date)}</span>
              <span aria-hidden="true" className="text-[#C8B2BE]">·</span>
              <span className="text-[#6B5368] font-normal">{estimateReadTime(story.content)}</span>
              <span aria-hidden="true" className="text-[#C8B2BE]">·</span>
              <span className="text-[#6B5368] font-normal tabular-nums">
                {toBengaliNumber(story.views)} বার পঠিত
              </span>
            </div>

            <h1 className="font-literary text-3xl sm:text-4xl lg:text-[42px] leading-[1.3] mb-4">
              {story.title}
            </h1>

            <p className="text-sm sm:text-base text-[#5B4459]">
              কলমে: <strong className="font-semibold text-[#241726]">{story.author}</strong>
            </p>
          </header>

          {/* Artwork Figure */}
          <figure className="max-w-3xl mx-auto mb-9">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#EADEE4] bg-[#F5EDF1]">
              <img
                src={coverSrc}
                alt={story.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-[#6B5368] italic text-center font-literary">
              অলঙ্করণ — {story.title} ({cat.label})
            </figcaption>
          </figure>

          {/* Long-Form Bengali Story Prose */}
          <div
            className="story-prose max-w-[68ch] mx-auto font-literary leading-[2.0] space-y-6 mb-10 text-justify"
            style={{ fontSize: `${fontSize}rem` }}
          >
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Reaction & Share Strip */}
          <div className="max-w-[68ch] mx-auto pt-6 pb-6 border-y border-[#EADEE4] flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => onToggleLike(story.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors cursor-pointer min-h-[42px] tabular-nums ${
                  isLiked
                    ? 'border-[#F43F5E]/40 bg-[#FFF1F2] text-[#BE123C]'
                    : 'border-[#EADEE4] bg-white text-[#241726] hover:bg-[#FDF2F8]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                <span>{isLiked ? 'পছন্দ করেছেন' : 'পছন্দ করুন'}</span>
                <span>({toBengaliNumber(story.likes)})</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(story.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors cursor-pointer min-h-[42px] ${
                  isFavorited
                    ? 'border-[#D97706]/40 bg-[#FFFBEB] text-[#B45309]'
                    : 'border-[#EADEE4] bg-white text-[#241726] hover:bg-[#FDF2F8]'
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span>{isFavorited ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#6B5368] mr-1 tabular-nums">
                শেয়ার ({toBengaliNumber(story.shares || 0)}):
              </span>
              <button
                type="button"
                onClick={handleNativeOrCopyShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EADEE4] bg-white text-xs font-semibold text-[#241726] hover:bg-[#FDF2F8] cursor-pointer min-h-[38px]"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>লিংক কপি</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onShareStory(story.id)}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-[#EADEE4] bg-white text-xs font-semibold text-[#047857] hover:bg-[#ECFDF5] min-h-[38px]"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onShareStory(story.id)}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-[#EADEE4] bg-white text-xs font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF] min-h-[38px]"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Monetization & Reader Support */}
          <div className="max-w-[68ch] mx-auto space-y-5 mb-10">
            <ReaderSupportCard settings={monetization} onNotify={onNotify} />
            <SponsorAdBanner settings={monetization} onAdClick={onAdClick} />
          </div>

          {/* Related Stories */}
          {relatedStories.length > 0 && (
            <section className="max-w-[68ch] mx-auto mb-10">
              <h2 className="font-literary text-2xl text-[#241726] mb-4">
                এই বিভাগের আরও গল্প
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {relatedStories.map((rel) => (
                  <StoryCard
                    key={rel.id}
                    story={rel}
                    isLiked={likedIds.includes(rel.id)}
                    isFavorited={favoriteIds.includes(rel.id)}
                    commentCount={(comments[rel.id] ?? []).length}
                    onOpenStory={onOpenStory}
                    onToggleLike={onToggleLike}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="max-w-[68ch] mx-auto pt-6 border-t border-[#EADEE4]">
            <h2 className="font-literary text-2xl flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-[#9D174D]" aria-hidden="true" />
              <span>পাঠকদের মন্তব্য ({toBengaliNumber(storyComments.length)})</span>
            </h2>

            <form
              onSubmit={handleCommentSubmit}
              className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-5 mb-6 space-y-4"
            >
              <div>
                <label htmlFor="commentAuthor" className="block text-sm font-semibold mb-1.5">
                  আপনার নাম *
                </label>
                <input
                  id="commentAuthor"
                  type="text"
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="commentText" className="block text-sm font-semibold mb-1.5">
                  আপনার অনুভূতি বা মন্তব্য *
                </label>
                <textarea
                  id="commentText"
                  required
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="গল্পটি পড়ে আপনার কেমন লাগল?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer"
              >
                মন্তব্য প্রকাশ করুন
              </button>
            </form>

            {storyComments.length === 0 ? (
              <p className="text-sm text-[#6B5368] py-4 text-center">
                এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
              </p>
            ) : (
              <div className="divide-y divide-[#EADEE4]">
                {storyComments.map((c) => (
                  <div key={c.id} className="py-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#9D174D]">{c.author}</span>
                      <span className="text-xs text-[#6B5368]">{formatBengaliDate(c.date)}</span>
                    </div>
                    <p className="text-[15px] text-[#3B283D] leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </article>
      </div>
    </>
  );
};
