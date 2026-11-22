import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Upload,
  RotateCcw,
  KeyRound,
  Reply,
  Send,
  Mail,
  Coins,
} from 'lucide-react';
import {
  AdminCredentials,
  AdminTab,
  CategoryId,
  ContactMessage,
  MonetizationSettings,
  Story,
  StoryComment,
} from '../types';
import { CATEGORIES, getCategoryInfo } from '../data/stories';
import { formatBengaliDate, toBengaliNumber } from '../utils/bengali';

interface AdminDashboardProps {
  isAdmin: boolean;
  adminCredentials: AdminCredentials;
  stories: Story[];
  comments: Record<string, StoryComment[]>;
  messages: ContactMessage[];
  monetization: MonetizationSettings;
  onLogin: (success: boolean) => void;
  onLogout: () => void;
  onUpdateCredentials: (nextCreds: AdminCredentials) => void;
  onUpdateMonetization: (next: MonetizationSettings) => void;
  onSaveStory: (storyData: Omit<Story, 'id' | 'date' | 'likes' | 'views' | 'shares'>, editId?: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteStory: (id: string) => void;
  onDeleteComment: (storyId: string, commentId: string) => void;
  onReplyMessage: (messageId: string, replyText: string) => void;
  onDeleteMessage: (id: string) => void;
  onViewStory: (id: string) => void;
  onNotify: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdmin,
  adminCredentials,
  stories,
  comments,
  messages,
  monetization,
  onLogin,
  onLogout,
  onUpdateCredentials,
  onUpdateMonetization,
  onSaveStory,
  onToggleStatus,
  onDeleteStory,
  onDeleteComment,
  onReplyMessage,
  onDeleteMessage,
  onViewStory,
  onNotify,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('editor');

  // Editor form state
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('love');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'published' | 'pending'>('published');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(false);

  // Inbox reply state
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Monetization draft state
  const [monForm, setMonForm] = useState<MonetizationSettings>(monetization);
  useEffect(() => {
    setMonForm(monetization);
  }, [monetization]);

  // Security / Password change state
  const [nextUsername, setNextUsername] = useState(adminCredentials.username);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Two-step inline delete confirmation key
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const isDefaultCredentials =
    adminCredentials.username === 'admin' && adminCredentials.password === '123456';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim() === adminCredentials.username &&
      password.trim() === adminCredentials.password
    ) {
      onLogin(true);
      setUsername('');
      setPassword('');
    } else {
      onLogin(false);
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass.trim() !== adminCredentials.password) {
      onNotify('বর্তমান পাসওয়ার্ডটি সঠিক নয়');
      return;
    }
    if (!nextUsername.trim()) {
      onNotify('ইউজারনেম ফাঁকা রাখা যাবে না');
      return;
    }
    if (newPass.trim().length < 6) {
      onNotify('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (newPass.trim() !== confirmPass.trim()) {
      onNotify('নতুন পাসওয়ার্ড দুটি মেলেনি');
      return;
    }
    onUpdateCredentials({
      username: nextUsername.trim(),
      password: newPass.trim(),
    });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const resetEditor = () => {
    setEditId(undefined);
    setTitle('');
    setCategory('love');
    setAuthor('');
    setStatus('published');
    setImage('');
    setContent('');
    setFeatured(false);
  };

  const startEdit = (story: Story) => {
    setEditId(story.id);
    setTitle(story.title);
    setCategory(story.category);
    setAuthor(story.author);
    setStatus(story.status);
    setImage(story.image);
    setContent(story.content);
    setFeatured(story.featured);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      onNotify('দয়া করে ১.৫ মেগাবাইটের কম আকারের ছবি নির্বাচন করুন');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        onNotify('ছবি সফলভাবে যুক্ত হয়েছে');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) return;
    const catInfo = getCategoryInfo(category);
    onSaveStory(
      {
        title: title.trim(),
        category,
        author: author.trim(),
        status,
        featured,
        image: image.trim() || catInfo.presetImage,
        content: content.trim(),
      },
      editId
    );
    resetEditor();
    setActiveTab('stories');
  };

  const handleMonetizationSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMonetization(monForm);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-[#EADEE4] rounded-2xl p-7 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#FDF2F8] text-[#9D174D] inline-flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="font-literary text-2xl text-[#241726]">অ্যাডমিন লগইন</h1>
            <p className="text-sm text-[#6B5368] mt-1">
              রঙিন ভাবনা পরিচালনা প্যানেলে প্রবেশ করতে লগইন করুন।
            </p>
          </div>

          {isDefaultCredentials ? (
            <div className="bg-[#FAF5F7] border border-dashed border-[#D6B8C8] rounded-xl p-3.5 text-xs text-[#4A354E] mb-5">
              <strong className="font-semibold text-[#9D174D] block mb-1">ডিফল্ট লগইন তথ্য:</strong>
              ইউজারনেম: <code className="font-mono bg-white px-1.5 py-0.5 rounded">admin</code> ·
              পাসওয়ার্ড: <code className="font-mono bg-white px-1.5 py-0.5 rounded">123456</code>
            </div>
          ) : (
            <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-3.5 text-xs text-[#4A354E] mb-5">
              আপনার পরিবর্তিত অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন।
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminUser" className="block text-sm font-semibold mb-1.5">
                ইউজারনেম
              </label>
              <input
                id="adminUser"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
              />
            </div>

            <div>
              <label htmlFor="adminPass" className="block text-sm font-semibold mb-1.5">
                পাসওয়ার্ড
              </label>
              <input
                id="adminPass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer min-h-[42px]"
            >
              লগইন করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalLikes = stories.reduce((sum, s) => sum + (s.likes || 0), 0);
  const totalViews = stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalShares =
    stories.reduce((sum, s) => sum + (s.shares || 0), 0) + (monetization.siteShares || 0);
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  const estimatedViewRevenue = (totalViews / 1000) * (monetization.rpmPer1000Views || 0);
  const estimatedShareRevenue = totalShares * (monetization.ratePerShare || 0);
  const estimatedAdRevenue = (monetization.adClicks || 0) * (monetization.ratePerAdClick || 0);
  const totalEstimatedRevenue = Math.round(
    estimatedViewRevenue + estimatedShareRevenue + estimatedAdRevenue
  );

  const flatComments = Object.entries(comments).flatMap(([storyId, list]) => {
    const story = stories.find((s) => s.id === storyId);
    return list.map((c) => ({
      ...c,
      storyId,
      storyTitle: story?.title ?? 'অজানা গল্প',
    }));
  });
  flatComments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabClass = (tab: AdminTab) =>
    `px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
      activeTab === tab
        ? 'bg-[#9D174D] text-white'
        : 'bg-[#FAF5F7] text-[#4A354E] hover:bg-[#F3E5EC]'
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-[#EADEE4] rounded-2xl p-5 sm:p-8">
        {/* Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#EADEE4]">
          <div>
            <h1 className="font-literary text-2xl sm:text-3xl text-[#241726]">
              রঙিন ভাবনা — অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-sm text-[#6B5368] mt-1">
              গল্প, পাঠকের ইনবক্স, আয় ও মনিটাইজেশন এবং পাসওয়ার্ড পরিচালনা করুন
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setNextUsername(adminCredentials.username);
                setActiveTab('security');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DCCBD4] bg-[#FAF5F7] text-[#241726] text-sm font-semibold hover:bg-[#F3E5EC] transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#9D174D]" aria-hidden="true" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] text-sm font-semibold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* 4-Column Tabular KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
            <div className="text-xs font-medium text-[#6B5368] mb-1">মোট গল্প</div>
            <div className="text-2xl font-bold text-[#9D174D] tabular-nums">
              {toBengaliNumber(stories.length)}
            </div>
          </div>
          <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
            <div className="text-xs font-medium text-[#6B5368] mb-1">মোট ভিউ</div>
            <div className="text-2xl font-bold text-[#9D174D] tabular-nums">
              {toBengaliNumber(totalViews)}
            </div>
          </div>
          <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
            <div className="text-xs font-medium text-[#6B5368] mb-1">মোট শেয়ার ও পছন্দ</div>
            <div className="text-2xl font-bold text-[#9D174D] tabular-nums">
              {toBengaliNumber(totalShares)} / {toBengaliNumber(totalLikes)}
            </div>
          </div>
          <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
            <div className="text-xs font-medium text-[#6B5368] mb-1">সম্ভাব্য আয় (হিসাব)</div>
            <div className="text-2xl font-bold text-[#047857] tabular-nums">
              ৳{toBengaliNumber(totalEstimatedRevenue)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-[#EADEE4]">
          <button type="button" onClick={() => setActiveTab('editor')} className={tabClass('editor')}>
            {editId ? 'গল্প সম্পাদনা' : 'নতুন গল্প লিখুন'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={tabClass('stories')}
          >
            সব গল্প ({toBengaliNumber(stories.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={tabClass('messages')}
          >
            ইনবক্স ({toBengaliNumber(messages.length)}
            {unreadMessagesCount > 0 ? ` · ${toBengaliNumber(unreadMessagesCount)} নতুন` : ''})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monetization')}
            className={tabClass('monetization')}
          >
            আয় ও মনিটাইজেশন
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={tabClass('comments')}
          >
            মন্তব্য ({toBengaliNumber(flatComments.length)})
          </button>
          <button
            type="button"
            onClick={() => {
              setNextUsername(adminCredentials.username);
              setActiveTab('security');
            }}
            className={tabClass('security')}
          >
            পাসওয়ার্ড পরিবর্তন
          </button>
        </div>

        {/* Tab 1: Editor */}
        {activeTab === 'editor' && (
          <form onSubmit={handleEditorSubmit} className="space-y-5">
            <h2 className="font-literary text-xl text-[#241726]">
              {editId ? `সম্পাদনা: ${title}` : 'নতুন গল্প তৈরি ও প্রকাশ করুন'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adminStoryTitle" className="block text-sm font-semibold mb-1.5">
                  গল্পের শিরোনাম *
                </label>
                <input
                  id="adminStoryTitle"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: শ্রাবণের শেষ বিকেল"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="adminStoryCat" className="block text-sm font-semibold mb-1.5">
                  গল্পের বিভাগ *
                </label>
                <select
                  id="adminStoryCat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-sm focus:outline-none focus:border-[#9D174D]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="adminStoryAuthor" className="block text-sm font-semibold mb-1.5">
                  লেখকের নাম *
                </label>
                <input
                  id="adminStoryAuthor"
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="যেমন: তানজিনা আক্তার"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="adminStoryStatus" className="block text-sm font-semibold mb-1.5">
                  অবস্থা
                </label>
                <select
                  id="adminStoryStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'pending')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-sm focus:outline-none focus:border-[#9D174D]"
                >
                  <option value="published">প্রকাশিত (Published)</option>
                  <option value="pending">খসড়া / অপেক্ষমান (Draft)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="adminStoryImage" className="block text-sm font-semibold mb-1.5">
                কভার ছবি (লিঙ্ক দিন, ফাইল আপলোড করুন অথবা নিচের ছবি বাছাই করুন)
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                <input
                  id="adminStoryImage"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="ছবির লিঙ্ক বা ফাঁকা রাখলে বিভাগের প্রচ্ছদ যুক্ত হবে"
                  className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DCCBD4] bg-[#FAF5F7] text-sm font-semibold text-[#241726] hover:bg-[#F3E5EC] cursor-pointer">
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>ছবি আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setImage(c.presetImage)}
                    title={c.label}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                      image === c.presetImage
                        ? 'border-[#9D174D] scale-105'
                        : 'border-[#EADEE4] hover:border-[#C8B2BE]'
                    }`}
                  >
                    <img
                      src={c.presetImage}
                      alt={c.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="adminStoryContent" className="block text-sm font-semibold mb-1.5">
                গল্পের মূল লেখা *
              </label>
              <textarea
                id="adminStoryContent"
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="এখানে আপনার সুন্দর গল্পটি লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm leading-relaxed focus:outline-none focus:border-[#9D174D]"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#9D174D]"
              />
              <span className="text-sm font-semibold text-[#241726]">
                নির্বাচিত গল্প হিসেবে হোমপেজে দেখান
              </span>
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer"
              >
                {editId ? 'পরিবর্তন সংরক্ষণ করুন' : 'গল্প প্রকাশ করুন'}
              </button>
              <button
                type="button"
                onClick={resetEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-sm font-semibold text-[#4A354E] hover:bg-[#FAF5F7] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>নতুন করে লিখুন</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manage Stories */}
        {activeTab === 'stories' && (
          <div className="divide-y divide-[#EADEE4]">
            {stories.length === 0 ? (
              <p className="text-center text-sm text-[#6B5368] py-8">কোনো গল্প নেই।</p>
            ) : (
              stories.map((s) => {
                const cat = getCategoryInfo(s.category);
                const deleteKey = `story-${s.id}`;
                const isConfirming = confirmDeleteKey === deleteKey;

                return (
                  <div
                    key={s.id}
                    className="py-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <strong className="font-literary text-lg text-[#241726]">{s.title}</strong>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            s.status === 'published' ? 'text-[#047857]' : 'text-[#B45309]'
                          }`}
                        >
                          {s.status === 'published' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>{s.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}</span>
                        </span>
                        {s.featured && (
                          <span className="text-xs font-semibold text-[#9D174D]">
                            · নির্বাচিত
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6B5368] tabular-nums">
                        {cat.label} · লেখক: {s.author} · {formatBengaliDate(s.date)} ·{' '}
                        {toBengaliNumber(s.views)} ভিউ · {toBengaliNumber(s.shares || 0)} শেয়ার ·{' '}
                        {toBengaliNumber(s.likes)} পছন্দ
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewStory(s.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold text-[#241726] hover:bg-[#FAF5F7] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>দেখুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(s.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold text-[#241726] hover:bg-[#FAF5F7] cursor-pointer"
                      >
                        {s.status === 'published' ? 'খসড়ায় নিন' : 'প্রকাশ করুন'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold text-[#241726] hover:bg-[#FAF5F7] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>সম্পাদনা</span>
                      </button>

                      {isConfirming ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteKey(null);
                              onDeleteStory(s.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                          >
                            নিশ্চিত মুছুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(null)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold text-[#4A354E] cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey(deleteKey)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>মুছুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Inbox & Reply */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-literary text-xl text-[#241726]">
                পাঠকের বার্তা ইনবক্স ও রিপ্লাই
              </h2>
              <p className="text-xs text-[#6B5368] mt-0.5">
                পাঠকেরা যোগাযোগ ফর্ম থেকে বার্তা পাঠালে এখানে দেখতে পাবেন এবং সরাসরি উত্তর দিতে
                পারবেন।
              </p>
            </div>

            {messages.length === 0 ? (
              <p className="text-center text-sm text-[#6B5368] py-8">
                ইনবক্সে এখনো কোনো বার্তা আসেনি।
              </p>
            ) : (
              <div className="divide-y divide-[#EADEE4]">
                {messages.map((m) => {
                  const deleteKey = `msg-${m.id}`;
                  const isConfirming = confirmDeleteKey === deleteKey;
                  const isReplying = openReplyId === m.id;
                  const looksLikeEmail = m.email.includes('@');

                  return (
                    <div key={m.id} className="py-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#241726]">
                              {m.name}
                            </span>
                            <span className="text-xs text-[#6B5368]">({m.email})</span>
                            <span
                              className={`text-xs font-semibold ${
                                m.status === 'replied' ? 'text-[#047857]' : 'text-[#9D174D]'
                              }`}
                            >
                              · {m.status === 'replied' ? 'উত্তর দেওয়া হয়েছে' : 'নতুন বার্তা'}
                            </span>
                          </div>
                          <p className="text-sm text-[#241726] leading-relaxed">{m.message}</p>
                          <div className="text-xs text-[#6B5368] mt-1">
                            {formatBengaliDate(m.date)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOpenReplyId(isReplying ? null : m.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9D174D] text-white text-xs font-semibold hover:bg-[#831843] cursor-pointer"
                          >
                            <Reply className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{isReplying ? 'বন্ধ করুন' : 'উত্তর দিন'}</span>
                          </button>

                          {looksLikeEmail && (
                            <a
                              href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('রঙিন ভাবনা — আপনার বার্তার উত্তর')}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold text-[#241726] hover:bg-[#FAF5F7]"
                            >
                              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>ইমেইল</span>
                            </a>
                          )}

                          {isConfirming ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteKey(null);
                                  onDeleteMessage(m.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                              >
                                নিশ্চিত মুছুন
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKey(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(deleteKey)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>মুছুন</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Existing Replies Thread */}
                      {m.replies && m.replies.length > 0 && (
                        <div className="pl-4 border-l-2 border-[#EADEE4] space-y-2">
                          {m.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="bg-[#FAF5F7] border border-[#EADEE4] rounded-lg p-3 text-sm"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                                <span className="font-semibold text-[#9D174D]">
                                  {rep.sender === 'admin' ? 'আপনার উত্তর (অ্যাডমিন)' : m.name}
                                </span>
                                <span className="text-[#6B5368]">
                                  {formatBengaliDate(rep.date)}
                                </span>
                              </div>
                              <p className="text-[#241726]">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline Reply Form */}
                      {isReplying && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const draft = (replyDrafts[m.id] || '').trim();
                            if (!draft) return;
                            onReplyMessage(m.id, draft);
                            setReplyDrafts((prev) => ({ ...prev, [m.id]: '' }));
                            setOpenReplyId(null);
                          }}
                          className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-3.5 space-y-2.5"
                        >
                          <label
                            htmlFor={`reply-${m.id}`}
                            className="block text-xs font-semibold text-[#4A354E]"
                          >
                            {m.name}-কে উত্তর লিখুন:
                          </label>
                          <textarea
                            id={`reply-${m.id}`}
                            rows={2}
                            required
                            value={replyDrafts[m.id] || ''}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                            }
                            placeholder="আপনার উত্তরটি এখানে লিখুন..."
                            className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm focus:outline-none focus:border-[#9D174D]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9D174D] text-white text-xs font-semibold hover:bg-[#831843] cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>উত্তর পাঠান</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenReplyId(null)}
                              className="px-3 py-2 rounded-lg border border-[#DCCBD4] bg-white text-xs font-semibold text-[#4A354E] cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Monetization & Views/Shares Revenue */}
        {activeTab === 'monetization' && (
          <form onSubmit={handleMonetizationSave} className="space-y-8">
            <div>
              <h2 className="font-literary text-xl text-[#241726] flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#9D174D]" aria-hidden="true" />
                <span>ভিউ ও শেয়ার ভিত্তিক আয় ও মনিটাইজেশন সেটিংস</span>
              </h2>
              <p className="text-sm text-[#6B5368] mt-1">
                পাঠকের ভিউ, শেয়ার এবং স্পন্সর বিজ্ঞাপনের মাধ্যমে আয়ের উৎস এখান থেকে চালু ও
                নিয়ন্ত্রণ করুন।
              </p>
            </div>

            {/* Live Tracked Revenue Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
                <div className="text-xs text-[#6B5368]">মোট ভিউ</div>
                <div className="text-xl font-bold text-[#241726] tabular-nums mt-0.5">
                  {toBengaliNumber(totalViews)}
                </div>
                <div className="text-[11px] text-[#047857] mt-1 tabular-nums">
                  হিসাব: ৳{toBengaliNumber(Math.round(estimatedViewRevenue))}
                </div>
              </div>
              <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
                <div className="text-xs text-[#6B5368]">মোট শেয়ার</div>
                <div className="text-xl font-bold text-[#241726] tabular-nums mt-0.5">
                  {toBengaliNumber(totalShares)}
                </div>
                <div className="text-[11px] text-[#047857] mt-1 tabular-nums">
                  হিসাব: ৳{toBengaliNumber(Math.round(estimatedShareRevenue))}
                </div>
              </div>
              <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4">
                <div className="text-xs text-[#6B5368]">বিজ্ঞাপন ক্লিক</div>
                <div className="text-xl font-bold text-[#241726] tabular-nums mt-0.5">
                  {toBengaliNumber(monetization.adClicks || 0)}
                </div>
                <div className="text-[11px] text-[#047857] mt-1 tabular-nums">
                  হিসাব: ৳{toBengaliNumber(Math.round(estimatedAdRevenue))}
                </div>
              </div>
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4">
                <div className="text-xs font-semibold text-[#065F46]">মোট সম্ভাব্য আয়</div>
                <div className="text-2xl font-bold text-[#047857] tabular-nums mt-0.5">
                  ৳{toBengaliNumber(totalEstimatedRevenue)}
                </div>
                <div className="text-[11px] text-[#065F46] mt-1">
                  নির্ধারিত রেট অনুযায়ী হিসাব
                </div>
              </div>
            </div>

            {/* Section 1: AdSense & Sponsor Banner */}
            <div className="border border-[#EADEE4] rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base text-[#241726]">
                  ১. বিজ্ঞাপন ও স্পন্সর ব্যানার (Google AdSense / কাস্টম স্পন্সর)
                </h3>
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monForm.adsEnabled}
                    onChange={(e) => setMonForm({ ...monForm, adsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#9D174D]"
                  />
                  <span>বিজ্ঞাপন স্লট চালু রাখুন</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monAdsenseId" className="block text-xs font-semibold mb-1">
                    Google AdSense Publisher ID (ঐচ্ছিক)
                  </label>
                  <input
                    id="monAdsenseId"
                    type="text"
                    value={monForm.adsenseId}
                    onChange={(e) => setMonForm({ ...monForm, adsenseId: e.target.value })}
                    placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm font-mono focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monSponsorTitle" className="block text-xs font-semibold mb-1">
                    স্পন্সর বিজ্ঞাপনের শিরোনাম
                  </label>
                  <input
                    id="monSponsorTitle"
                    type="text"
                    value={monForm.sponsorTitle}
                    onChange={(e) => setMonForm({ ...monForm, sponsorTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="monSponsorDesc" className="block text-xs font-semibold mb-1">
                    স্পন্সর বিজ্ঞাপনের বিবরণ
                  </label>
                  <input
                    id="monSponsorDesc"
                    type="text"
                    value={monForm.sponsorDescription}
                    onChange={(e) =>
                      setMonForm({ ...monForm, sponsorDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monSponsorUrl" className="block text-xs font-semibold mb-1">
                    বিজ্ঞাপন বা অ্যাফিলিয়েট লিংক (URL)
                  </label>
                  <input
                    id="monSponsorUrl"
                    type="url"
                    value={monForm.sponsorUrl}
                    onChange={(e) => setMonForm({ ...monForm, sponsorUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monSponsorBtn" className="block text-xs font-semibold mb-1">
                    বাটনের লেখা
                  </label>
                  <input
                    id="monSponsorBtn"
                    type="text"
                    value={monForm.sponsorButtonText}
                    onChange={(e) =>
                      setMonForm({ ...monForm, sponsorButtonText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Reader Support (bKash / Nagad / Support Link) */}
            <div className="border border-[#EADEE4] rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base text-[#241726]">
                  ২. পাঠক সহায়তা ও অনুদান (বিকাশ / নগদ / পেমেন্ট লিংক)
                </h3>
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monForm.supportEnabled}
                    onChange={(e) =>
                      setMonForm({ ...monForm, supportEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9D174D]"
                  />
                  <span>সহায়তা কার্ড চালু রাখুন</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monSupportHead" className="block text-xs font-semibold mb-1">
                    শিরোনাম
                  </label>
                  <input
                    id="monSupportHead"
                    type="text"
                    value={monForm.supportHeading}
                    onChange={(e) => setMonForm({ ...monForm, supportHeading: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monSupportLink" className="block text-xs font-semibold mb-1">
                    পেমেন্ট / সাপোর্ট লিংক (ঐচ্ছিক)
                  </label>
                  <input
                    id="monSupportLink"
                    type="url"
                    value={monForm.supportLink}
                    onChange={(e) => setMonForm({ ...monForm, supportLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="monSupportMsg" className="block text-xs font-semibold mb-1">
                    বার্তা
                  </label>
                  <input
                    id="monSupportMsg"
                    type="text"
                    value={monForm.supportMessage}
                    onChange={(e) => setMonForm({ ...monForm, supportMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monBkash" className="block text-xs font-semibold mb-1">
                    বিকাশ নম্বর (bKash)
                  </label>
                  <input
                    id="monBkash"
                    type="text"
                    value={monForm.bkashNumber}
                    onChange={(e) => setMonForm({ ...monForm, bkashNumber: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm font-mono focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monNagad" className="block text-xs font-semibold mb-1">
                    নগদ নম্বর (Nagad)
                  </label>
                  <input
                    id="monNagad"
                    type="text"
                    value={monForm.nagadNumber}
                    onChange={(e) => setMonForm({ ...monForm, nagadNumber: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm font-mono focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Rate Calculator */}
            <div className="border border-[#EADEE4] rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-base text-[#241726]">
                ৩. ভিউ, শেয়ার ও বিজ্ঞাপন ক্লিকের আয়ের হার (৳ টাকায়)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="monRpm" className="block text-xs font-semibold mb-1">
                    প্রতি ১,০০০ ভিউ রেট (৳)
                  </label>
                  <input
                    id="monRpm"
                    type="number"
                    min={0}
                    step="1"
                    value={monForm.rpmPer1000Views}
                    onChange={(e) =>
                      setMonForm({ ...monForm, rpmPer1000Views: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm tabular-nums focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monShareRate" className="block text-xs font-semibold mb-1">
                    প্রতি শেয়ার মূল্য (৳)
                  </label>
                  <input
                    id="monShareRate"
                    type="number"
                    min={0}
                    step="0.1"
                    value={monForm.ratePerShare}
                    onChange={(e) =>
                      setMonForm({ ...monForm, ratePerShare: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm tabular-nums focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="monClickRate" className="block text-xs font-semibold mb-1">
                    প্রতি বিজ্ঞাপন ক্লিক রেট (৳)
                  </label>
                  <input
                    id="monClickRate"
                    type="number"
                    min={0}
                    step="0.5"
                    value={monForm.ratePerAdClick}
                    onChange={(e) =>
                      setMonForm({ ...monForm, ratePerAdClick: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCCBD4] text-sm tabular-nums focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
              </div>
              <p className="text-xs text-[#6B5368] leading-relaxed">
                টিপস: সরাসরি আয় পেতে আপনার নিজস্ব ডোমেইনে সাইটটি পাবলিশ করে উপরের বক্সে Google
                AdSense / Adsterra আইডি, অ্যাফিলিয়েট/স্পন্সর লিংক এবং আপনার বিকাশ বা নগদ নম্বর
                যুক্ত করে দিন।
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer"
            >
              মনিটাইজেশন সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        )}

        {/* Tab 5: Comments */}
        {activeTab === 'comments' && (
          <div className="divide-y divide-[#EADEE4]">
            {flatComments.length === 0 ? (
              <p className="text-center text-sm text-[#6B5368] py-8">
                এখনো কোনো পাঠকের মন্তব্য পাওয়া যায়নি।
              </p>
            ) : (
              flatComments.map((c) => {
                const deleteKey = `comment-${c.id}`;
                const isConfirming = confirmDeleteKey === deleteKey;
                return (
                  <div
                    key={c.id}
                    className="py-4 flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-[220px]">
                      <div className="text-xs font-semibold text-[#9D174D] mb-1">
                        গল্প: {c.storyTitle}
                      </div>
                      <p className="text-sm text-[#241726] mb-1">“{c.text}”</p>
                      <div className="text-xs text-[#6B5368]">
                        {c.author} · {formatBengaliDate(c.date)}
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteKey(null);
                            onDeleteComment(c.storyId, c.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                        >
                          নিশ্চিত মুছুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey(null)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#EADEE4] text-xs font-semibold cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(deleteKey)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 6: Security & Password Change */}
        {activeTab === 'security' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="font-literary text-xl text-[#241726] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#9D174D]" aria-hidden="true" />
                <span>অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন</span>
              </h2>
              <p className="text-sm text-[#6B5368] mt-1">
                আপনার অ্যাডমিন অ্যাকাউন্টের ইউজারনেম ও পাসওয়ার্ড এখান থেকে পরিবর্তন করতে পারবেন।
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label htmlFor="secUsername" className="block text-sm font-semibold mb-1.5">
                  নতুন ইউজারনেম *
                </label>
                <input
                  id="secUsername"
                  type="text"
                  required
                  value={nextUsername}
                  onChange={(e) => setNextUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="secCurrentPass" className="block text-sm font-semibold mb-1.5">
                  বর্তমান পাসওয়ার্ড *
                </label>
                <input
                  id="secCurrentPass"
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="secNewPass" className="block text-sm font-semibold mb-1.5">
                  নতুন পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)
                </label>
                <input
                  id="secNewPass"
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <div>
                <label htmlFor="secConfirmPass" className="block text-sm font-semibold mb-1.5">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                <input
                  id="secConfirmPass"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="আবার নতুন পাসওয়ার্ড লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer"
              >
                পাসওয়ার্ড সংরক্ষণ করুন
              </button>
            </form>

            <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4 text-xs text-[#5B4459] leading-relaxed">
              <strong>গুরুত্বপূর্ণ তথ্য:</strong> এই পরিবর্তনটি আপনার বর্তমান ব্রাউজারের লোকাল স্টোরেজে
              সংরক্ষিত থাকে। ভবিষ্যতে সাইটটি সবার জন্য স্থায়ীভাবে পাবলিশ করলে এবং সব ডিভাইস থেকে
              অ্যাডমিন লগইন ও গল্প নিয়ন্ত্রণ করতে চাইলে Firebase Auth ও ডাটাবেজ যুক্ত করে নিতে পারবেন।
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
