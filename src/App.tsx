import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, BookOpen, PenLine, X, SlidersHorizontal, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import {
  AdminCredentials,
  CategoryId,
  ContactMessage,
  InfoModalType,
  MonetizationSettings,
  Story,
  StoryComment,
  ViewMode,
} from './types';
import {
  BRAND_LOGO_PATH,
  CATEGORIES,
  DEFAULT_MONETIZATION_SETTINGS,
  INITIAL_COMMENTS,
  INITIAL_MESSAGES,
  INITIAL_STORIES,
  getCategoryInfo,
} from './data/stories';
import { formatBengaliDate, toBengaliNumber } from './utils/bengali';
import { Header } from './components/Header';
import { LeadStorySpotlight, StoryCard } from './components/StoryCard';
import { StoryReader } from './components/StoryReader';
import { AdminDashboard } from './components/AdminDashboard';
import { InfoModal, SubmitStoryModal } from './components/Modals';
import { Footer } from './components/Footer';
import { WelcomeInvitation } from './components/WelcomeInvitation';
import { SponsorAdBanner } from './components/MonetizationWidgets';

function toLocalDateKey(isoStr: string): string {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const STORAGE_KEYS = {
  stories: 'rongin_bhabna_stories_v1',
  likes: 'rongin_bhabna_likes_v1',
  favorites: 'rongin_bhabna_favs_v1',
  comments: 'rongin_bhabna_comments_v1',
  messages: 'rongin_bhabna_messages_v1',
  adminAuth: 'rongin_bhabna_admin_auth_v1',
  adminCreds: 'rongin_bhabna_admin_creds_v1',
  monetization: 'rongin_bhabna_monetization_v1',
} as const;

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: '123456',
};

interface ToastItem {
  id: number;
  message: string;
}

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [stories, setStories] = useState<Story[]>(() => {
    const raw = readJsonStorage<Story[]>(STORAGE_KEYS.stories, INITIAL_STORIES);
    return raw.map((s) => ({ ...s, shares: s.shares ?? 0 }));
  });
  const [likedIds, setLikedIds] = useState<string[]>(() =>
    readJsonStorage<string[]>(STORAGE_KEYS.likes, [])
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readJsonStorage<string[]>(STORAGE_KEYS.favorites, [])
  );
  const [comments, setComments] = useState<Record<string, StoryComment[]>>(() =>
    readJsonStorage<Record<string, StoryComment[]>>(STORAGE_KEYS.comments, INITIAL_COMMENTS)
  );
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const raw = readJsonStorage<ContactMessage[]>(STORAGE_KEYS.messages, INITIAL_MESSAGES);
    return raw.map((m) => ({
      ...m,
      status: m.status ?? (m.replies && m.replies.length > 0 ? 'replied' : 'unread'),
      replies: m.replies ?? [],
    }));
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.adminAuth) === 'true';
    } catch {
      return false;
    }
  });
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() =>
    readJsonStorage<AdminCredentials>(STORAGE_KEYS.adminCreds, DEFAULT_ADMIN_CREDENTIALS)
  );
  const [monetization, setMonetization] = useState<MonetizationSettings>(() => ({
    ...DEFAULT_MONETIZATION_SETTINGS,
    ...readJsonStorage<Partial<MonetizationSettings>>(
      STORAGE_KEYS.monetization,
      DEFAULT_MONETIZATION_SETTINGS
    ),
  }));

  const [showInvitation, setShowInvitation] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const categoryBarRef = useRef<HTMLDivElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
    } catch {
      // Ignore quota errors
    }
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.likes, JSON.stringify(likedIds));
    } catch {
      // Ignore
    }
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteIds));
    } catch {
      // Ignore
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
    } catch {
      // Ignore
    }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.adminAuth, String(isAdmin));
    } catch {
      // Ignore
    }
  }, [isAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.adminCreds, JSON.stringify(adminCredentials));
    } catch {
      // Ignore
    }
  }, [adminCredentials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.monetization, JSON.stringify(monetization));
    } catch {
      // Ignore
    }
  }, [monetization]);

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Handle deep link on initial mount
  useEffect(() => {
    if (window.location.hash.startsWith('#story=')) {
      const targetId = window.location.hash.replace('#story=', '');
      const found = stories.find((s) => s.id === targetId);
      if (found) {
        setCurrentStoryId(found.id);
        setCurrentView('reader');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToCatalog = () => {
    setTimeout(() => {
      categoryBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleNavigateHome = () => {
    setActiveCategory('all');
    setShowFavoritesOnly(false);
    setShowAllMode(false);
    setSearchQuery('');
    setAuthorFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAllStories = () => {
    setActiveCategory('all');
    setShowFavoritesOnly(false);
    setShowAllMode(true);
    setSearchQuery('');
    setAuthorFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentView('home');
    scrollToCatalog();
  };

  const handleOpenFavorites = () => {
    setActiveCategory('all');
    setShowFavoritesOnly(true);
    setShowAllMode(false);
    setCurrentView('home');
    scrollToCatalog();
  };

  const handleSelectCategory = (catId: 'all' | CategoryId) => {
    setActiveCategory(catId);
    setShowFavoritesOnly(false);
    setShowAllMode(catId !== 'all');
    setCurrentView('home');
    scrollToCatalog();
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setAuthorFilter('');
    setDateFrom('');
    setDateTo('');
    setShowFavoritesOnly(false);
    setShowAllMode(false);
  };

  const handleOpenStory = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, views: (s.views || 0) + 1 } : s))
    );
    setCurrentStoryId(id);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = (id: string) => {
    const alreadyLiked = likedIds.includes(id);
    setLikedIds((prev) =>
      alreadyLiked ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, likes: alreadyLiked ? Math.max(0, s.likes - 1) : s.likes + 1 }
          : s
      )
    );
    notify(alreadyLiked ? 'পছন্দ সরানো হয়েছে' : 'গল্পটি আপনার ভালো লেগেছে');
  };

  const handleToggleFavorite = (id: string) => {
    const alreadyFav = favoriteIds.includes(id);
    setFavoriteIds((prev) =>
      alreadyFav ? prev.filter((item) => item !== id) : [...prev, id]
    );
    notify(
      alreadyFav
        ? 'পছন্দের তালিকা থেকে সরানো হয়েছে'
        : 'পছন্দের তালিকায় সংরক্ষিত হয়েছে'
    );
  };

  const handleAddComment = (storyId: string, author: string, text: string) => {
    const newComment: StoryComment = {
      id: `cm-${Date.now()}`,
      author,
      text,
      date: new Date().toISOString(),
    };
    setComments((prev) => ({
      ...prev,
      [storyId]: [newComment, ...(prev[storyId] ?? [])],
    }));
    notify('আপনার সুন্দর মন্তব্যটি যুক্ত হয়েছে');
  };

  const handleReaderSubmitStory = (data: {
    title: string;
    category: CategoryId;
    author: string;
    content: string;
    autoPublish: boolean;
  }) => {
    const catInfo = getCategoryInfo(data.category);
    const newStory: Story = {
      id: `st-${Date.now()}`,
      title: data.title,
      category: data.category,
      author: data.author,
      date: new Date().toISOString(),
      image: catInfo.presetImage,
      featured: false,
      status: data.autoPublish ? 'published' : 'pending',
      likes: 0,
      views: data.autoPublish ? 1 : 0,
      shares: 0,
      content: data.content,
    };

    setStories((prev) => [newStory, ...prev]);
    setSubmitModalOpen(false);

    if (data.autoPublish) {
      notify('অভিনন্দন! আপনার গল্পটি প্রকাশিত হয়েছে');
      setCurrentStoryId(newStory.id);
      setCurrentView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      notify('আপনার গল্পটি অ্যাডমিন অনুমোদনের জন্য পাঠানো হয়েছে');
    }
  };

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      notify('স্বাগতম অ্যাডমিন!');
    } else {
      notify('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    notify('অ্যাডমিন প্যানেল থেকে লগআউট সম্পন্ন হয়েছে');
  };

  const handleUpdateCredentials = (nextCreds: AdminCredentials) => {
    setAdminCredentials(nextCreds);
    notify('অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে');
  };

  const handleUpdateMonetization = (next: MonetizationSettings) => {
    setMonetization(next);
    notify('আয় ও মনিটাইজেশন সেটিংস সংরক্ষিত হয়েছে');
  };

  const handleTrackStoryShare = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, shares: (s.shares || 0) + 1 } : s))
    );
  };

  const handleTrackSiteShare = () => {
    setMonetization((prev) => ({ ...prev, siteShares: (prev.siteShares || 0) + 1 }));
  };

  const handleTrackAdClick = () => {
    setMonetization((prev) => ({ ...prev, adClicks: (prev.adClicks || 0) + 1 }));
  };

  const handleAdminSaveStory = (
    storyData: Omit<Story, 'id' | 'date' | 'likes' | 'views' | 'shares'>,
    editId?: string
  ) => {
    if (editId) {
      setStories((prev) =>
        prev.map((s) => (s.id === editId ? { ...s, ...storyData } : s))
      );
      notify('গল্পটি সফলভাবে হালনাগাদ করা হয়েছে');
    } else {
      const newStory: Story = {
        id: `st-${Date.now()}`,
        date: new Date().toISOString(),
        likes: 0,
        views: 0,
        shares: 0,
        ...storyData,
      };
      setStories((prev) => [newStory, ...prev]);
      notify('নতুন গল্প সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে');
    }
  };

  const handleToggleStoryStatus = (id: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'published' ? 'pending' : 'published';
        notify(nextStatus === 'published' ? 'গল্পটি প্রকাশিত হয়েছে' : 'গল্পটি খসড়ায় রাখা হয়েছে');
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleDeleteStory = (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setComments((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    notify('গল্পটি মুছে ফেলা হয়েছে');
  };

  const handleDeleteComment = (storyId: string, commentId: string) => {
    setComments((prev) => ({
      ...prev,
      [storyId]: (prev[storyId] ?? []).filter((c) => c.id !== commentId),
    }));
    notify('মন্তব্যটি মুছে ফেলা হয়েছে');
  };

  const handleSendContactMessage = (name: string, email: string, message: string) => {
    const msg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      message,
      date: new Date().toISOString(),
      status: 'unread',
      replies: [],
    };
    setMessages((prev) => [msg, ...prev]);
    notify('আপনার বার্তা ইনবক্সে পাঠানো হয়েছে! অ্যাডমিন উত্তর দিলে এখানে দেখতে পাবেন');
  };

  const handleReplyMessage = (messageId: string, replyText: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'replied',
              replies: [
                ...(m.replies ?? []),
                {
                  id: `rep-${Date.now()}`,
                  text: replyText,
                  date: new Date().toISOString(),
                  sender: 'admin',
                },
              ],
            }
          : m
      )
    );
    notify('পাঠকের বার্তায় উত্তর পাঠানো হয়েছে');
  };

  const handleReaderFollowUp = (messageId: string, replyText: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'unread',
              replies: [
                ...(m.replies ?? []),
                {
                  id: `rep-${Date.now()}`,
                  text: replyText,
                  date: new Date().toISOString(),
                  sender: 'reader',
                },
              ],
            }
          : m
      )
    );
    notify('আপনার পাল্টা উত্তর পাঠানো হয়েছে');
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    notify('বার্তাটি মুছে ফেলা হয়েছে');
  };

  const publishedStories = useMemo(
    () => stories.filter((s) => s.status === 'published'),
    [stories]
  );

  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    publishedStories.forEach((s) => {
      if (s.author.trim()) set.add(s.author.trim());
    });
    return Array.from(set);
  }, [publishedStories]);

  const activeAdvancedFilterCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (authorFilter.trim() !== '' ? 1 : 0) +
    (dateFrom !== '' || dateTo !== '' ? 1 : 0);

  const isFiltering =
    searchQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    authorFilter.trim() !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    showFavoritesOnly ||
    showAllMode;

  const filteredStories = useMemo(() => {
    let list = [...publishedStories];
    if (showFavoritesOnly) {
      list = list.filter((s) => favoriteIds.includes(s.id));
    }
    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory);
    }

    const authorQ = authorFilter.trim().toLowerCase();
    if (authorQ) {
      list = list.filter((s) => s.author.toLowerCase().includes(authorQ));
    }

    if (dateFrom || dateTo) {
      list = list.filter((s) => {
        const storyDay = toLocalDateKey(s.date);
        if (!storyDay) return false;
        if (dateFrom && storyDay < dateFrom) return false;
        if (dateTo && storyDay > dateTo) return false;
        return true;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    publishedStories,
    showFavoritesOnly,
    favoriteIds,
    activeCategory,
    authorFilter,
    dateFrom,
    dateTo,
    searchQuery,
  ]);

  const filteredSummaryParts = useMemo(() => {
    const parts: string[] = [];
    if (showFavoritesOnly) parts.push('পছন্দের তালিকা');
    if (activeCategory !== 'all') parts.push(getCategoryInfo(activeCategory).label);
    if (authorFilter.trim()) parts.push(`লেখক: ${authorFilter.trim()}`);
    if (dateFrom && dateTo) {
      parts.push(`${formatBengaliDate(dateFrom)} – ${formatBengaliDate(dateTo)}`);
    } else if (dateFrom) {
      parts.push(`${formatBengaliDate(dateFrom)} থেকে`);
    } else if (dateTo) {
      parts.push(`${formatBengaliDate(dateTo)} পর্যন্ত`);
    }
    if (searchQuery.trim()) parts.push(`শব্দ: “${searchQuery.trim()}”`);
    return parts;
  }, [showFavoritesOnly, activeCategory, authorFilter, dateFrom, dateTo, searchQuery]);

  const filteredHeading = useMemo(() => {
    if (showFavoritesOnly && filteredSummaryParts.length === 1) {
      return `আপনার পছন্দের গল্প (${toBengaliNumber(filteredStories.length)}টি)`;
    }
    if (filteredSummaryParts.length > 0) {
      return `অনুসন্ধান ফলাফল (${toBengaliNumber(filteredStories.length)}টি)`;
    }
    return `সকল গল্পসমূহ (${toBengaliNumber(filteredStories.length)}টি)`;
  }, [showFavoritesOnly, filteredSummaryParts.length, filteredStories.length]);

  // 3-Tier Editorial Front Page slices
  const leadStory = useMemo(
    () => publishedStories.find((s) => s.featured) ?? publishedStories[0] ?? null,
    [publishedStories]
  );

  const secondaryFeatured = useMemo(
    () =>
      publishedStories
        .filter((s) => s.featured && s.id !== leadStory?.id)
        .slice(0, 3),
    [publishedStories, leadStory]
  );

  const latestStories = useMemo(
    () =>
      [...publishedStories]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [publishedStories]
  );

  const popularStories = useMemo(
    () => [...publishedStories].sort((a, b) => b.likes - a.likes).slice(0, 3),
    [publishedStories]
  );

  const activeReaderStory = useMemo(
    () => stories.find((s) => s.id === currentStoryId) ?? null,
    [stories, currentStoryId]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9FA] text-[#241726]">
      <Header
        currentView={currentView}
        showAllMode={showAllMode}
        showFavoritesOnly={showFavoritesOnly}
        favoritesCount={favoriteIds.length}
        onNavigateHome={handleNavigateHome}
        onOpenAllStories={handleOpenAllStories}
        onOpenFavorites={handleOpenFavorites}
        onOpenSubmitModal={() => setSubmitModalOpen(true)}
        onNavigateAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
            {/* Editorial Masthead Hero */}
            <section className="bg-white border border-[#EADEE4] rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center">
              <div className="w-24 h-24 mx-auto mb-3">
                <img
                  src={BRAND_LOGO_PATH}
                  alt="রঙিন ভাবনা"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold tracking-wide text-[#9D174D] mb-1.5">
                বাংলা গল্পের অনলাইন ম্যাগাজিন
              </p>
              <h1 className="font-literary text-4xl sm:text-5xl text-[#241726] leading-tight mb-3">
                রঙিন ভাবনা
              </h1>
              <p className="font-literary text-lg sm:text-xl text-[#9D174D] mb-3">
                “মনের কথাগুলো রঙে রঙে সাজাই...”
              </p>
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#5B4459] leading-relaxed mb-7">
                ভালোবাসা, আনন্দ, বেদনা, বাস্তব জীবন এবং ইসলামিক অনুপ্রেরণায় ভরা হৃদয়ছোঁয়া বাংলা
                গল্পের এক প্রশান্ত ভুবন। পড়ুন, অনুভব করুন এবং আপনার নিজের গল্পও সবার মাঝে ছড়িয়ে দিন।
              </p>

              {/* Search & Expandable Advanced Filters */}
              <div className="max-w-3xl mx-auto mb-7 text-left">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <label htmlFor="storySearch" className="sr-only">
                      গল্প খুঁজুন
                    </label>
                    <input
                      id="storySearch"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="গল্পের নাম, লেখক বা বিষয় লিখে খুঁজুন..."
                      className="w-full pl-5 pr-11 py-3 rounded-xl border border-[#DCCBD4] bg-[#FCF9FA] text-sm text-[#241726] placeholder-[#8C7489] focus:outline-none focus:border-[#9D174D] focus:bg-white transition-colors min-h-[44px]"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="অনুসন্ধান মুছুন"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-[#6B5368] hover:bg-[#F3E5EC] inline-flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <span
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D174D] pointer-events-none"
                        aria-hidden="true"
                      >
                        <Search className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdvancedSearchOpen((prev) => !prev)}
                    aria-expanded={advancedSearchOpen}
                    aria-controls="advanced-search-panel"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[44px] ${
                      advancedSearchOpen || activeAdvancedFilterCount > 0
                        ? 'border-[#9D174D] bg-[#FDF2F8] text-[#9D174D]'
                        : 'border-[#DCCBD4] bg-white text-[#4A354E] hover:bg-[#FAF5F7]'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    <span>
                      উন্নত ফিল্টার
                      {activeAdvancedFilterCount > 0
                        ? ` (${toBengaliNumber(activeAdvancedFilterCount)})`
                        : ''}
                    </span>
                    {advancedSearchOpen ? (
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {advancedSearchOpen && (
                  <div
                    id="advanced-search-panel"
                    className="mt-3 p-4 sm:p-5 rounded-xl border border-[#EADEE4] bg-[#FAF5F7] space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div>
                        <label
                          htmlFor="advFilterCategory"
                          className="block text-xs font-semibold text-[#4A354E] mb-1.5"
                        >
                          গল্পের বিভাগ
                        </label>
                        <select
                          id="advFilterCategory"
                          value={activeCategory}
                          onChange={(e) =>
                            setActiveCategory(e.target.value as 'all' | CategoryId)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] focus:outline-none focus:border-[#9D174D] min-h-[40px]"
                        >
                          <option value="all">সব বিভাগ</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="advFilterAuthor"
                          className="block text-xs font-semibold text-[#4A354E] mb-1.5"
                        >
                          লেখকের নাম
                        </label>
                        <input
                          id="advFilterAuthor"
                          type="text"
                          list="author-suggestions"
                          value={authorFilter}
                          onChange={(e) => setAuthorFilter(e.target.value)}
                          placeholder="যেমন: তানজিনা ইসলাম"
                          className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] placeholder-[#8C7489] focus:outline-none focus:border-[#9D174D] min-h-[40px]"
                        />
                        <datalist id="author-suggestions">
                          {uniqueAuthors.map((authorName) => (
                            <option key={authorName} value={authorName} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label
                          htmlFor="advFilterDateFrom"
                          className="block text-xs font-semibold text-[#4A354E] mb-1.5"
                        >
                          প্রকাশের শুরু তারিখ
                        </label>
                        <input
                          id="advFilterDateFrom"
                          type="date"
                          value={dateFrom}
                          max={dateTo || undefined}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] focus:outline-none focus:border-[#9D174D] min-h-[40px]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="advFilterDateTo"
                          className="block text-xs font-semibold text-[#4A354E] mb-1.5"
                        >
                          প্রকাশের শেষ তারিখ
                        </label>
                        <input
                          id="advFilterDateTo"
                          type="date"
                          value={dateTo}
                          min={dateFrom || undefined}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm text-[#241726] focus:outline-none focus:border-[#9D174D] min-h-[40px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EADEE4]">
                      <span className="text-xs text-[#6B5368] tabular-nums">
                        {isFiltering
                          ? `মোট ${toBengaliNumber(filteredStories.length)}টি গল্প মিলেছে`
                          : 'বিভাগ, লেখক ও তারিখ অনুযায়ী গল্প খুঁজুন'}
                      </span>

                      <div className="flex items-center gap-2.5">
                        {isFiltering && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-3.5 py-1.5 rounded-lg border border-[#DCCBD4] bg-white text-xs font-semibold text-[#4A354E] hover:bg-[#F3E5EC] transition-colors cursor-pointer"
                          >
                            সব ফিল্টার মুছুন
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={scrollToCatalog}
                          className="px-4 py-1.5 rounded-lg bg-[#9D174D] text-white text-xs font-semibold hover:bg-[#831843] transition-colors cursor-pointer"
                        >
                          ফলাফল দেখুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer min-h-[42px]"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>গল্প পড়া শুরু করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-[#241726] text-sm font-semibold hover:bg-[#FAF5F7] transition-colors cursor-pointer min-h-[42px]"
                >
                  <PenLine className="w-4 h-4 text-[#9D174D]" aria-hidden="true" />
                  <span>আপনার গল্প পাঠান</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalType('share')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-[#241726] text-sm font-semibold hover:bg-[#FAF5F7] transition-colors cursor-pointer min-h-[42px]"
                >
                  <Share2 className="w-4 h-4 text-[#9D174D]" aria-hidden="true" />
                  <span>শেয়ার করুন</span>
                </button>
              </div>
            </section>

            {/* Category Filter Bar */}
            <div
              ref={categoryBarRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
              role="tablist"
              aria-label="গল্পের বিভাগসমূহ"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all' && !showFavoritesOnly}
                onClick={() => handleSelectCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[40px] ${
                  activeCategory === 'all' && !showFavoritesOnly
                    ? 'bg-[#9D174D] text-white'
                    : 'bg-white border border-[#EADEE4] text-[#4A354E] hover:bg-[#FDF2F8]'
                }`}
              >
                সব গল্প
              </button>
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id && !showFavoritesOnly;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[40px] ${
                      isSelected
                        ? 'bg-[#9D174D] text-white'
                        : 'bg-white border border-[#EADEE4] text-[#4A354E] hover:bg-[#FDF2F8]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Filtered Catalog OR 3-Tier Magazine Homepage */}
            {isFiltering ? (
              <section className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#EADEE4] pb-3">
                  <div>
                    <h2 className="font-literary text-2xl sm:text-3xl text-[#241726]">
                      {filteredHeading}
                    </h2>
                    {filteredSummaryParts.length > 0 && (
                      <p className="text-xs text-[#6B5368] mt-1">
                        সক্রিয় ফিল্টার: {filteredSummaryParts.join(' · ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-sm font-semibold text-[#9D174D] hover:underline cursor-pointer"
                  >
                    ফিল্টার মুছুন
                  </button>
                </div>

                {filteredStories.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#D6B8C8] rounded-2xl py-14 px-6 text-center space-y-3">
                    <h3 className="font-literary text-xl text-[#241726]">
                      কোনো গল্প পাওয়া যায়নি
                    </h3>
                    <p className="text-sm text-[#6B5368]">
                      আপনার খোঁজা শব্দ বা বিভাগে এখনো কোনো গল্প নেই।
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-2 px-5 py-2 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] cursor-pointer"
                    >
                      সব গল্প দেখুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isLiked={likedIds.includes(story.id)}
                        isFavorited={favoriteIds.includes(story.id)}
                        commentCount={(comments[story.id] ?? []).length}
                        onOpenStory={handleOpenStory}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <div className="space-y-12">
                {/* Tier 1: Lead Featured Story */}
                {leadStory && (
                  <section aria-labelledby="lead-story-heading">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h2
                        id="lead-story-heading"
                        className="font-literary text-2xl text-[#241726]"
                      >
                        নির্বাচিত প্রচ্ছদ গল্প
                      </h2>
                      <button
                        type="button"
                        onClick={handleOpenAllStories}
                        className="text-sm font-semibold text-[#9D174D] hover:underline cursor-pointer"
                      >
                        সব গল্প দেখুন
                      </button>
                    </div>
                    <LeadStorySpotlight
                      story={leadStory}
                      isLiked={likedIds.includes(leadStory.id)}
                      isFavorited={favoriteIds.includes(leadStory.id)}
                      commentCount={(comments[leadStory.id] ?? []).length}
                      onOpenStory={handleOpenStory}
                      onToggleLike={handleToggleLike}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </section>
                )}

                {/* Secondary Featured */}
                {secondaryFeatured.length > 0 && (
                  <section aria-labelledby="featured-heading">
                    <div className="flex items-center justify-between gap-4 pb-3 mb-5 border-b border-[#EADEE4]">
                      <h2 id="featured-heading" className="font-literary text-2xl text-[#241726]">
                        আরও নির্বাচিত গল্প
                      </h2>
                      <button
                        type="button"
                        onClick={handleOpenAllStories}
                        className="text-sm font-semibold text-[#9D174D] hover:underline cursor-pointer"
                      >
                        সব দেখুন
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {secondaryFeatured.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          isLiked={likedIds.includes(story.id)}
                          isFavorited={favoriteIds.includes(story.id)}
                          commentCount={(comments[story.id] ?? []).length}
                          onOpenStory={handleOpenStory}
                          onToggleLike={handleToggleLike}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Tier 2: Latest Stories */}
                <section aria-labelledby="latest-heading">
                  <div className="flex items-center justify-between gap-4 pb-3 mb-5 border-b border-[#EADEE4]">
                    <h2 id="latest-heading" className="font-literary text-2xl text-[#241726]">
                      সর্বশেষ প্রকাশিত গল্প
                    </h2>
                    <button
                      type="button"
                      onClick={handleOpenAllStories}
                      className="text-sm font-semibold text-[#9D174D] hover:underline cursor-pointer"
                    >
                      আরও পড়ুন
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isLiked={likedIds.includes(story.id)}
                        isFavorited={favoriteIds.includes(story.id)}
                        commentCount={(comments[story.id] ?? []).length}
                        onOpenStory={handleOpenStory}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>

                {/* Sponsor / Ad Monetization Banner */}
                <SponsorAdBanner settings={monetization} onAdClick={handleTrackAdClick} />

                {/* Tier 3: Popular Stories */}
                <section aria-labelledby="popular-heading">
                  <div className="flex items-center justify-between gap-4 pb-3 mb-5 border-b border-[#EADEE4]">
                    <h2 id="popular-heading" className="font-literary text-2xl text-[#241726]">
                      পাঠকপ্রিয় গল্প
                    </h2>
                    <button
                      type="button"
                      onClick={handleOpenAllStories}
                      className="text-sm font-semibold text-[#9D174D] hover:underline cursor-pointer"
                    >
                      সকল তালিকা
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isLiked={likedIds.includes(story.id)}
                        isFavorited={favoriteIds.includes(story.id)}
                        commentCount={(comments[story.id] ?? []).length}
                        onOpenStory={handleOpenStory}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {currentView === 'reader' && activeReaderStory && (
          <StoryReader
            story={activeReaderStory}
            allStories={stories}
            isLiked={likedIds.includes(activeReaderStory.id)}
            isFavorited={favoriteIds.includes(activeReaderStory.id)}
            likedIds={likedIds}
            favoriteIds={favoriteIds}
            comments={comments}
            monetization={monetization}
            onBack={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStory={handleOpenStory}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            onShareStory={handleTrackStoryShare}
            onAdClick={handleTrackAdClick}
            onAddComment={handleAddComment}
            onNotify={notify}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            isAdmin={isAdmin}
            adminCredentials={adminCredentials}
            stories={stories}
            comments={comments}
            messages={messages}
            monetization={monetization}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            onUpdateCredentials={handleUpdateCredentials}
            onUpdateMonetization={handleUpdateMonetization}
            onSaveStory={handleAdminSaveStory}
            onToggleStatus={handleToggleStoryStatus}
            onDeleteStory={handleDeleteStory}
            onDeleteComment={handleDeleteComment}
            onReplyMessage={handleReplyMessage}
            onDeleteMessage={handleDeleteMessage}
            onViewStory={handleOpenStory}
            onNotify={notify}
          />
        )}
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenInfo={(type) => setInfoModalType(type)}
        onReplayInvitation={() => setShowInvitation(true)}
        onNavigateAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <WelcomeInvitation
        open={showInvitation}
        onEnter={() => setShowInvitation(false)}
      />

      <SubmitStoryModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={handleReaderSubmitStory}
      />

      <InfoModal
        type={infoModalType}
        messages={messages}
        onClose={() => setInfoModalType(null)}
        onSendContact={handleSendContactMessage}
        onReaderFollowUp={handleReaderFollowUp}
        onTrackSiteShare={handleTrackSiteShare}
        onNotify={notify}
      />

      {/* Toast Stack */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-[#241726] text-white text-sm font-medium px-4 py-3 rounded-xl border border-[#4A354E] shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
