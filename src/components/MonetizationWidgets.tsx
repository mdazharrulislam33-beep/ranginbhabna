import React, { useState } from 'react';
import { ExternalLink, HeartHandshake, Copy, Check } from 'lucide-react';
import { MonetizationSettings } from '../types';

interface SponsorAdBannerProps {
  settings: MonetizationSettings;
  onAdClick: () => void;
}

export const SponsorAdBanner: React.FC<SponsorAdBannerProps> = ({ settings, onAdClick }) => {
  if (!settings.adsEnabled) return null;

  return (
    <aside
      aria-label="স্পন্সর বিজ্ঞাপন"
      className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-[#6B5368]">
          <span className="font-semibold text-[#9D174D]">স্পন্সর ও বিজ্ঞাপন</span>
          {settings.adsenseId.trim() && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">AdSense: {settings.adsenseId.trim()}</span>
            </>
          )}
        </div>
        <h3 className="font-literary text-lg sm:text-xl text-[#241726]">
          {settings.sponsorTitle || 'রঙিন ভাবনা স্পন্সর স্পট'}
        </h3>
        <p className="text-sm text-[#5B4459] leading-relaxed max-w-2xl">
          {settings.sponsorDescription}
        </p>
      </div>

      {settings.sponsorUrl.trim() && (
        <a
          href={settings.sponsorUrl.trim()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onAdClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#241726] text-white text-xs sm:text-sm font-semibold hover:bg-[#3B283D] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <span>{settings.sponsorButtonText || 'বিস্তারিত দেখুন'}</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      )}
    </aside>
  );
};

interface ReaderSupportCardProps {
  settings: MonetizationSettings;
  onNotify: (msg: string) => void;
}

export const ReaderSupportCard: React.FC<ReaderSupportCardProps> = ({ settings, onNotify }) => {
  const [copiedKey, setCopiedKey] = useState<'bkash' | 'nagad' | null>(null);

  if (!settings.supportEnabled) return null;

  const hasBkash = settings.bkashNumber.trim().length > 0;
  const hasNagad = settings.nagadNumber.trim().length > 0;
  const hasLink = settings.supportLink.trim().length > 0;

  if (!hasBkash && !hasNagad && !hasLink) {
    return null;
  }

  const copyNumber = async (num: string, type: 'bkash' | 'nagad', label: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedKey(type);
      onNotify(`${label} নম্বরটি কপি করা হয়েছে: ${num}`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      onNotify(`${label} নম্বর: ${num}`);
    }
  };

  return (
    <aside className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white border border-[#EADEE4] text-[#9D174D] flex items-center justify-center shrink-0">
          <HeartHandshake className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-literary text-lg sm:text-xl text-[#241726]">
            {settings.supportHeading}
          </h3>
          <p className="text-sm text-[#5B4459] leading-relaxed mt-0.5">
            {settings.supportMessage}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {hasBkash && (
          <button
            type="button"
            onClick={() => copyNumber(settings.bkashNumber.trim(), 'bkash', 'বিকাশ')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E2136E]/30 bg-white text-xs sm:text-sm font-semibold text-[#B91C60] hover:bg-[#FDF2F8] transition-colors cursor-pointer tabular-nums"
          >
            {copiedKey === 'bkash' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>বিকাশ: {settings.bkashNumber.trim()}</span>
          </button>
        )}

        {hasNagad && (
          <button
            type="button"
            onClick={() => copyNumber(settings.nagadNumber.trim(), 'nagad', 'নগদ')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#EA580C]/30 bg-white text-xs sm:text-sm font-semibold text-[#C2410C] hover:bg-[#FFF7ED] transition-colors cursor-pointer tabular-nums"
          >
            {copiedKey === 'nagad' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>নগদ: {settings.nagadNumber.trim()}</span>
          </button>
        )}

        {hasLink && (
          <a
            href={settings.supportLink.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9D174D] text-white text-xs sm:text-sm font-semibold hover:bg-[#831843] transition-colors"
          >
            <span>সরাসরি সহায়তা লিংক</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </aside>
  );
};
