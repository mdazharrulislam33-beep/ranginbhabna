import React, { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { BRAND_LOGO_PATH } from '../data/stories';

interface WelcomeInvitationProps {
  open: boolean;
  onEnter: () => void;
}

export const WelcomeInvitation: React.FC<WelcomeInvitationProps> = ({ open, onEnter }) => {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open || paused) return;
    const timer = window.setTimeout(() => {
      onEnter();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [open, paused, onEnter]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onEnter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#241726]/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-invitation-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onEnter();
      }}
    >
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative w-full max-w-md bg-white border border-[#EADEE4] rounded-3xl p-7 sm:p-9 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onEnter}
          aria-label="বন্ধ করুন ও ম্যাগাজিনে প্রবেশ করুন"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF5F7] text-[#4A354E] hover:bg-[#F3E5EC] inline-flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-xs font-semibold tracking-wide text-[#9D174D] mb-4">
          আন্তরিক আমন্ত্রণ · বাংলা গল্পের ভুবন
        </p>

        <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-5 rounded-2xl bg-[#FCF9FA] border border-[#F0E6EB] p-3 flex items-center justify-center">
          <img
            src={BRAND_LOGO_PATH}
            alt="রঙিন ভাবনা লোগো"
            className="w-full h-full object-contain"
          />
        </div>

        <h1
          id="welcome-invitation-title"
          className="font-literary text-2xl sm:text-3xl text-[#241726] mb-2"
        >
          রঙিন ভাবনায় আপনাকে স্বাগতম
        </h1>

        <p className="font-literary text-base text-[#9D174D] mb-3">
          “মনের কথাগুলো রঙে রঙে সাজাই...”
        </p>

        <p className="text-sm text-[#5B4459] leading-relaxed mb-6">
          ভালোবাসা, জীবনবোধ, হাসি-কান্না ও অনুপ্রেরণার গল্প পড়ুন এবং আপনার নিজের লেখাও সবার সাথে
          ভাগ করে নিন।
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer min-h-[46px]"
        >
          <span>ম্যাগাজিনে প্রবেশ করুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
