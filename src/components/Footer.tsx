import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CategoryId, InfoModalType } from '../types';
import { CATEGORIES } from '../data/stories';

export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/share/1cYwRXxmAs/';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onOpenInfo: (type: InfoModalType) => void;
  onReplayInvitation: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenInfo,
  onReplayInvitation,
  onNavigateAdmin,
}) => {
  return (
    <footer className="border-t border-[#EADEE4] bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h2 className="font-literary text-2xl text-[#241726] mb-2">রঙিন ভাবনা</h2>
            <p className="text-sm text-[#5B4459] leading-relaxed max-w-sm mb-4">
              “মনের কথাগুলো রঙে রঙে সাজাই...” — বাংলা সাহিত্যের অনুরাগী ও নতুন লেখকদের জন্য একটি
              আন্তরিক অনলাইন গল্প ম্যাগাজিন।
            </p>
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9D174D] hover:underline"
            >
              <span>অফিশিয়াল ফেসবুক পেজ</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#9D174D] mb-3">গল্পের বিভাগ</h3>
            <ul className="space-y-2 text-sm text-[#5B4459]">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(c.id)}
                    className="hover:text-[#9D174D] transition-colors cursor-pointer text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#9D174D] mb-3">প্রয়োজনীয় লিংক</h3>
            <ul className="space-y-2 text-sm text-[#5B4459]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo('about')}
                  className="hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo('contact')}
                  className="hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  যোগাযোগ ও বার্তা ইনবক্স
                </button>
              </li>
              <li>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#9D174D] transition-colors"
                >
                  <span>ফেসবুক পেজ</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfo('share')}
                  className="hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  ম্যাগাজিন শেয়ার করুন
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onReplayInvitation}
                  className="hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  স্বাগতম আমন্ত্রণ দেখুন
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  অ্যাডমিন প্যানেল
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#F0E6EB] text-center text-xs text-[#6B5368]">
          © রঙিন ভাবনা — সর্বস্বত্ব সংরক্ষিত | বাংলা গল্পের অনলাইন ম্যাগাজিন
        </div>
      </div>
    </footer>
  );
};
