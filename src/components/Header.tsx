import React, { useState } from 'react';
import { Menu, X, PenLine } from 'lucide-react';
import { ViewMode } from '../types';
import { toBengaliNumber } from '../utils/bengali';

interface HeaderProps {
  currentView: ViewMode;
  showAllMode: boolean;
  showFavoritesOnly: boolean;
  favoritesCount: number;
  onNavigateHome: () => void;
  onOpenAllStories: () => void;
  onOpenFavorites: () => void;
  onOpenSubmitModal: () => void;
  onNavigateAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  showAllMode,
  showFavoritesOnly,
  favoritesCount,
  onNavigateHome,
  onOpenAllStories,
  onOpenFavorites,
  onOpenSubmitModal,
  onNavigateAdmin,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomeActive = currentView === 'home' && !showAllMode && !showFavoritesOnly;
  const isAllActive = currentView === 'home' && showAllMode && !showFavoritesOnly;
  const isFavActive = currentView === 'home' && showFavoritesOnly;
  const isAdminActive = currentView === 'admin';

  const navLinkClass = (active: boolean) =>
    `whitespace-nowrap shrink-0 text-[15px] font-medium py-1.5 border-b-2 transition-colors cursor-pointer ${
      active
        ? 'border-[#BE185D] text-[#9D174D]'
        : 'border-transparent text-[#4A354E] hover:text-[#9D174D]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FCF9FA]/92 backdrop-blur-md border-b border-[#EADEE4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            onNavigateHome();
          }}
          className="font-literary text-2xl font-normal tracking-tight text-[#241726] hover:text-[#9D174D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE185D]"
        >
          রঙিন ভাবনা
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="প্রধান মেনু">
          <button type="button" onClick={onNavigateHome} className={navLinkClass(isHomeActive)}>
            হোম
          </button>
          <button type="button" onClick={onOpenAllStories} className={navLinkClass(isAllActive)}>
            সব গল্প
          </button>
          <button type="button" onClick={onOpenFavorites} className={navLinkClass(isFavActive)}>
            পছন্দের গল্প ({toBengaliNumber(favoritesCount)})
          </button>
          <button type="button" onClick={onNavigateAdmin} className={navLinkClass(isAdminActive)}>
            অ্যাডমিন
          </button>
        </nav>

        {/* Zone 3: Primary CTA + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D174D]"
          >
            <PenLine className="w-4 h-4" aria-hidden="true" />
            <span>গল্প লিখুন</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#EADEE4] bg-white text-[#241726] hover:bg-[#FDF2F8] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#EADEE4] bg-white px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNavigateHome();
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium min-h-[44px] ${
              isHomeActive ? 'bg-[#FDF2F8] text-[#9D174D]' : 'text-[#241726]'
            }`}
          >
            হোম
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAllStories();
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium min-h-[44px] ${
              isAllActive ? 'bg-[#FDF2F8] text-[#9D174D]' : 'text-[#241726]'
            }`}
          >
            সব গল্প
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenFavorites();
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium min-h-[44px] ${
              isFavActive ? 'bg-[#FDF2F8] text-[#9D174D]' : 'text-[#241726]'
            }`}
          >
            পছন্দের গল্প ({toBengaliNumber(favoritesCount)})
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNavigateAdmin();
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium min-h-[44px] ${
              isAdminActive ? 'bg-[#FDF2F8] text-[#9D174D]' : 'text-[#241726]'
            }`}
          >
            অ্যাডমিন ড্যাশবোর্ড
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenSubmitModal();
            }}
            className="mt-1 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#9D174D] text-white text-base font-semibold min-h-[44px]"
          >
            <PenLine className="w-4 h-4" aria-hidden="true" />
            <span>গল্প লিখুন</span>
          </button>
        </div>
      )}
    </header>
  );
};
