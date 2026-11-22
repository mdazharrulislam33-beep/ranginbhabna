import React, { useState } from 'react';
import { Heart, Bookmark, MessageSquare, ArrowRight, Share2 } from 'lucide-react';
import { Story } from '../types';
import { getCategoryInfo } from '../data/stories';
import {
  estimateReadTime,
  formatBengaliDate,
  makeFallbackCoverSvg,
  toBengaliNumber,
} from '../utils/bengali';

interface StoryCardProps {
  story: Story;
  isLiked: boolean;
  isFavorited: boolean;
  commentCount: number;
  onOpenStory: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const LeadStorySpotlight: React.FC<StoryCardProps> = ({
  story,
  isLiked,
  isFavorited,
  commentCount,
  onOpenStory,
  onToggleLike,
  onToggleFavorite,
}) => {
  const cat = getCategoryInfo(story.category);
  const [imgError, setImgError] = useState(false);
  const coverSrc =
    imgError || !story.image
      ? makeFallbackCoverSvg(story.title, '#FBCFE8', cat.accentHex)
      : story.image;

  return (
    <article className="bg-white border border-[#EADEE4] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
      <button
        type="button"
        onClick={() => onOpenStory(story.id)}
        className="lg:col-span-7 relative overflow-hidden bg-[#F5EDF1] cursor-pointer text-left group min-h-[240px] lg:min-h-[340px]"
      >
        <img
          src={coverSrc}
          alt={story.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </button>

      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#9D174D] mb-3">
            <span>প্রধান নির্বাচিত গল্প</span>
            <span aria-hidden="true" className="text-[#C8B2BE]">·</span>
            <span className="text-[#6B5368] font-medium">{cat.label}</span>
          </div>

          <h3 className="font-literary text-2xl sm:text-3xl leading-snug text-[#241726] mb-3">
            <button
              type="button"
              onClick={() => onOpenStory(story.id)}
              className="text-left hover:text-[#9D174D] transition-colors cursor-pointer"
            >
              {story.title}
            </button>
          </h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B5368] mb-4">
            <span>{story.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formatBengaliDate(story.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{estimateReadTime(story.content)}</span>
          </div>

          <p className="text-[15px] text-[#4A354E] leading-relaxed line-clamp-4 mb-6">
            {story.content.replace(/\n+/g, ' ')}
          </p>
        </div>

        <div className="pt-4 border-t border-[#F0E6EB] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-[#6B5368] tabular-nums">
            <button
              type="button"
              onClick={() => onToggleLike(story.id)}
              aria-label={isLiked ? 'পছন্দ সরান' : 'গল্পটি পছন্দ করুন'}
              className={`inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                isLiked
                  ? 'border-[#F43F5E]/40 bg-[#FFF1F2] text-[#BE123C]'
                  : 'border-[#EADEE4] bg-white text-[#5B4459] hover:bg-[#FDF2F8]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
              <span>{toBengaliNumber(story.likes)}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(story.id)}
              aria-label={isFavorited ? 'সংরক্ষিত তালিকা থেকে সরান' : 'গল্পটি সংরক্ষণ করুন'}
              className={`inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                isFavorited
                  ? 'border-[#D97706]/40 bg-[#FFFBEB] text-[#B45309]'
                  : 'border-[#EADEE4] bg-white text-[#5B4459] hover:bg-[#FDF2F8]'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
              <span>{isFavorited ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
            </button>

            <span className="inline-flex items-center gap-1 text-[#6B5368]" title="মন্তব্য">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{toBengaliNumber(commentCount)}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[#6B5368]" title="শেয়ার">
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{toBengaliNumber(story.shares || 0)}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenStory(story.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>সম্পূর্ণ পড়ুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isLiked,
  isFavorited,
  commentCount,
  onOpenStory,
  onToggleLike,
  onToggleFavorite,
}) => {
  const cat = getCategoryInfo(story.category);
  const [imgError, setImgError] = useState(false);
  const coverSrc =
    imgError || !story.image
      ? makeFallbackCoverSvg(story.title, '#FBCFE8', cat.accentHex)
      : story.image;

  return (
    <article className="bg-white border border-[#EADEE4] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1">
      <button
        type="button"
        onClick={() => onOpenStory(story.id)}
        className="aspect-[4/3] w-full overflow-hidden bg-[#F5EDF1] cursor-pointer text-left group"
      >
        <img
          src={coverSrc}
          alt={story.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </button>

      <div className="p-5 flex flex-col flex-1">
        {/* Zero-pill unboxed metadata */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6B5368] mb-2">
          <span className="font-semibold" style={{ color: cat.accentHex }}>
            {cat.label}
          </span>
          {story.featured && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#9D174D]">নির্বাচিত</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatBengaliDate(story.date)}</span>
        </div>

        <h3 className="font-literary text-xl leading-snug text-[#241726] mb-2">
          <button
            type="button"
            onClick={() => onOpenStory(story.id)}
            className="text-left hover:text-[#9D174D] transition-colors cursor-pointer"
          >
            {story.title}
          </button>
        </h3>

        <p className="text-sm text-[#5B4459] leading-relaxed line-clamp-3 mb-4 flex-1">
          {story.content.replace(/\n+/g, ' ')}
        </p>

        <div className="text-xs text-[#7A6176] mb-3">
          <span>লেখক: {story.author}</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{estimateReadTime(story.content)}</span>
        </div>

        <div className="pt-3 border-t border-[#F0E6EB] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs tabular-nums">
            <button
              type="button"
              onClick={() => onToggleLike(story.id)}
              aria-label={isLiked ? 'পছন্দ সরান' : 'পছন্দ করুন'}
              className={`inline-flex items-center gap-1 py-1.5 px-2 rounded-md border transition-colors cursor-pointer min-h-[34px] ${
                isLiked
                  ? 'border-[#F43F5E]/40 bg-[#FFF1F2] text-[#BE123C]'
                  : 'border-[#EADEE4] text-[#5B4459] hover:bg-[#FDF2F8]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
              <span>{toBengaliNumber(story.likes)}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(story.id)}
              aria-label={isFavorited ? 'সংরক্ষণ সরান' : 'সংরক্ষণ করুন'}
              className={`inline-flex items-center justify-center p-1.5 rounded-md border transition-colors cursor-pointer min-h-[34px] min-w-[34px] ${
                isFavorited
                  ? 'border-[#D97706]/40 bg-[#FFFBEB] text-[#B45309]'
                  : 'border-[#EADEE4] text-[#5B4459] hover:bg-[#FDF2F8]'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>

            <span className="inline-flex items-center gap-1 text-[#6B5368] px-1" title="মন্তব্য">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{toBengaliNumber(commentCount)}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[#6B5368] px-1" title="শেয়ার">
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{toBengaliNumber(story.shares || 0)}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenStory(story.id)}
            className="text-sm font-semibold text-[#9D174D] hover:text-[#701A75] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 py-1"
          >
            <span>পড়ুন</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
