import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Share2, Send } from 'lucide-react';
import { CategoryId, ContactMessage, InfoModalType } from '../types';
import { CATEGORIES } from '../data/stories';
import { formatBengaliDate, toBengaliNumber } from '../utils/bengali';

interface SubmitStoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: CategoryId;
    author: string;
    content: string;
    autoPublish: boolean;
  }) => void;
}

export const SubmitStoryModal: React.FC<SubmitStoryModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('love');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) return;
    onSubmit({
      title: title.trim(),
      category,
      author: author.trim(),
      content: content.trim(),
      autoPublish,
    });
    setTitle('');
    setAuthor('');
    setContent('');
    setAutoPublish(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#241726]/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <div className="bg-white border border-[#EADEE4] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF5F7] text-[#241726] hover:bg-[#F3E5EC] inline-flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 id="submit-modal-title" className="font-literary text-2xl text-[#241726] mb-1">
          আপনার গল্প পাঠান
        </h2>
        <p className="text-sm text-[#6B5368] mb-5">
          আপনার লেখা গল্পটি “রঙিন ভাবনা”-তে প্রকাশের জন্য জমা দিন।
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subTitle" className="block text-sm font-semibold mb-1.5">
              গল্পের শিরোনাম *
            </label>
            <input
              id="subTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="গল্পের সুন্দর একটি নাম দিন"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
            />
          </div>

          <div>
            <label htmlFor="subCat" className="block text-sm font-semibold mb-1.5">
              বিভাগ *
            </label>
            <select
              id="subCat"
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
            <label htmlFor="subAuthor" className="block text-sm font-semibold mb-1.5">
              আপনার নাম *
            </label>
            <input
              id="subAuthor"
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
            />
          </div>

          <div>
            <label htmlFor="subContent" className="block text-sm font-semibold mb-1.5">
              গল্পের লেখা *
            </label>
            <textarea
              id="subContent"
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="মনের কথাগুলো রঙে রঙে সাজিয়ে লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm leading-relaxed focus:outline-none focus:border-[#9D174D]"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#9D174D]"
            />
            <span className="text-xs text-[#5B4459] leading-relaxed">
              সরাসরি ম্যাগাজিনে প্রকাশ করুন (টিক তুলে দিলে অ্যাডমিন অনুমোদনের জন্য জমা থাকবে)
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer min-h-[42px]"
          >
            গল্প জমা দিন
          </button>
        </form>
      </div>
    </div>
  );
};

interface InfoModalProps {
  type: InfoModalType;
  messages: ContactMessage[];
  onClose: () => void;
  onSendContact: (name: string, email: string, message: string) => void;
  onReaderFollowUp: (messageId: string, replyText: string) => void;
  onTrackSiteShare: () => void;
  onNotify: (msg: string) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  type,
  messages,
  onClose,
  onSendContact,
  onReaderFollowUp,
  onTrackSiteShare,
  onNotify,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [contactTab, setContactTab] = useState<'send' | 'inbox'>('send');
  const [followUpText, setFollowUpText] = useState<Record<string, string>>({});

  if (!type) return null;

  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const shareText =
    'রঙিন ভাবনা — মনের কথাগুলো রঙে রঙে সাজাই... হৃদয়ছোঁয়া বাংলা গল্পের অনলাইন ম্যাগাজিন।';

  const handleCopySiteUrl = async () => {
    if (!siteUrl) return;
    onTrackSiteShare();
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      onNotify('ম্যাগাজিনের ওয়েব লিংক কপি করা হয়েছে');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('লিংকটি কপি করতে উপরের টেক্সট সিলেক্ট করুন');
    }
  };

  const handleNativeShare = async () => {
    onTrackSiteShare();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'রঙিন ভাবনা — বাংলা গল্পের অনলাইন ম্যাগাজিন',
          text: shareText,
          url: siteUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopySiteUrl();
    }
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    onSendContact(name.trim(), email.trim(), message.trim());
    setName('');
    setEmail('');
    setMessage('');
    setContactTab('inbox');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#241726]/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#EADEE4] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF5F7] text-[#241726] hover:bg-[#F3E5EC] inline-flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {type === 'about' && (
          <div className="space-y-4">
            <h2 className="font-literary text-2xl text-[#241726]">
              আমাদের সম্পর্কে — রঙিন ভাবনা
            </h2>
            <p className="text-sm text-[#4A354E] leading-relaxed">
              <strong>“রঙিন ভাবনা”</strong> একটি আধুনিক বাংলা গল্পের অনলাইন ম্যাগাজিন। আমাদের মূল লক্ষ্য
              হলো মানুষের মনের অব্যক্ত অনুভূতি, ভালোবাসা, জীবন সংগ্রাম এবং ইসলামিক নৈতিক শিক্ষাকে
              সুন্দর শব্দের গাঁথুনিতে পাঠকদের সামনে তুলে ধরা।
            </p>
            <p className="text-sm text-[#6B5368] leading-relaxed">
              একজন পাঠক যেমন এখানে হৃদয়ছোঁয়া গল্প পড়ে প্রশান্তি পাবেন, তেমনি নতুন লেখকেরাও অনায়াসে
              নিজের গল্প প্রকাশ করে পাঠকদের ভালোবাসা অর্জন করতে পারবেন।
            </p>
            <div className="bg-[#FAF5F7] border border-[#EADEE4] rounded-xl p-4 font-literary text-base text-[#9D174D]">
              “মনের কথাগুলো রঙে রঙে সাজাই...”
            </div>
            <div className="pt-1">
              <a
                href="https://www.facebook.com/share/1cYwRXxmAs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DCCBD4] bg-white text-sm font-semibold text-[#9D174D] hover:bg-[#FDF2F8] transition-colors"
              >
                <span>অফিশিয়াল ফেসবুক পেজে যুক্ত হোন</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div>
            <h2 className="font-literary text-2xl text-[#241726] mb-1">যোগাযোগ ও ইনবক্স</h2>
            <p className="text-sm text-[#6B5368] mb-4">
              অ্যাডমিনের কাছে বার্তা পাঠান অথবা পাঠানো বার্তার উত্তর দেখুন।
            </p>

            <div className="flex items-center gap-2 p-1 bg-[#FAF5F7] border border-[#EADEE4] rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setContactTab('send')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  contactTab === 'send'
                    ? 'bg-white text-[#9D174D] shadow-xs'
                    : 'text-[#5B4459] hover:text-[#241726]'
                }`}
              >
                নতুন বার্তা পাঠান
              </button>
              <button
                type="button"
                onClick={() => setContactTab('inbox')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer tabular-nums ${
                  contactTab === 'inbox'
                    ? 'bg-white text-[#9D174D] shadow-xs'
                    : 'text-[#5B4459] hover:text-[#241726]'
                }`}
              >
                ইনবক্স ও উত্তর ({toBengaliNumber(messages.length)})
              </button>
            </div>

            {contactTab === 'send' ? (
              <form onSubmit={handleContact} className="space-y-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold mb-1.5">
                    আপনার নাম *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-semibold mb-1.5">
                    ইমেইল বা মোবাইল নম্বর *
                  </label>
                  <input
                    id="contactEmail"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <div>
                  <label htmlFor="contactMsg" className="block text-sm font-semibold mb-1.5">
                    আপনার বার্তা *
                  </label>
                  <textarea
                    id="contactMsg"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="আপনার কথা এখানে লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCCBD4] text-sm focus:outline-none focus:border-[#9D174D]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors cursor-pointer min-h-[42px]"
                >
                  বার্তা পাঠান
                </button>
              </form>
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <p className="text-sm text-[#6B5368] text-center py-6">
                    এখনো কোনো বার্তা নেই।
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="border border-[#EADEE4] rounded-xl p-4 bg-[#FCF9FA] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#241726]">{m.name}</span>
                        <span
                          className={`font-semibold ${
                            m.status === 'replied' ? 'text-[#047857]' : 'text-[#B45309]'
                          }`}
                        >
                          {m.status === 'replied' ? 'উত্তর পাওয়া গেছে' : 'অপেক্ষমান'}
                        </span>
                      </div>
                      <p className="text-sm text-[#4A354E]">{m.message}</p>
                      <div className="text-[11px] text-[#6B5368]">
                        {formatBengaliDate(m.date)}
                      </div>

                      {m.replies && m.replies.length > 0 && (
                        <div className="pt-2 border-t border-[#EADEE4] space-y-2">
                          {m.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className={`p-2.5 rounded-lg text-xs ${
                                rep.sender === 'admin'
                                  ? 'bg-white border border-[#EADEE4] text-[#241726]'
                                  : 'bg-[#FDF2F8] text-[#4A354E]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1 font-semibold">
                                <span className={rep.sender === 'admin' ? 'text-[#9D174D]' : ''}>
                                  {rep.sender === 'admin' ? 'অ্যাডমিন উত্তর' : m.name}
                                </span>
                                <span className="font-normal text-[#6B5368]">
                                  {formatBengaliDate(rep.date)}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const txt = (followUpText[m.id] || '').trim();
                          if (!txt) return;
                          onReaderFollowUp(m.id, txt);
                          setFollowUpText((prev) => ({ ...prev, [m.id]: '' }));
                        }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={followUpText[m.id] || ''}
                          onChange={(e) =>
                            setFollowUpText((prev) => ({ ...prev, [m.id]: e.target.value }))
                          }
                          placeholder="পাল্টা উত্তর লিখুন..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#DCCBD4] bg-white text-xs focus:outline-none focus:border-[#9D174D]"
                        />
                        <button
                          type="submit"
                          aria-label="পাঠান"
                          className="p-2 rounded-lg bg-[#9D174D] text-white hover:bg-[#831843] cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {type === 'facebook' && (
          <div className="text-center py-4 space-y-4">
            <h2 className="font-literary text-2xl text-[#241726]">
              রঙিন ভাবনা — অফিশিয়াল ফেসবুক পেজ
            </h2>
            <p className="text-sm text-[#6B5368] leading-relaxed">
              প্রতিদিনের নতুন গল্প, অণুগল্প ও পাঠকদের আড্ডায় যুক্ত হতে আমাদের ফেসবুক পেজে ফলো
              করুন।
            </p>
            <a
              href="https://www.facebook.com/share/1cYwRXxmAs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#9D174D] text-white text-sm font-semibold hover:bg-[#831843] transition-colors"
            >
              <span>ফেসবুক পেজে যান</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        )}

        {type === 'share' && (
          <div className="space-y-5 pt-1">
            <div>
              <h2 className="font-literary text-2xl text-[#241726] mb-1">
                রঙিন ভাবনা শেয়ার করুন
              </h2>
              <p className="text-sm text-[#6B5368]">
                আপনার ফেসবুক পেজ, বন্ধু বা পাঠকদের সাথে ম্যাগাজিনের ওয়েব লিংকটি শেয়ার করুন।
              </p>
            </div>

            <div>
              <label
                htmlFor="shareSiteUrlInput"
                className="block text-xs font-semibold text-[#4A354E] mb-1.5"
              >
                ওয়েবসাইট লিংক
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="shareSiteUrlInput"
                  type="text"
                  readOnly
                  value={siteUrl}
                  onClick={(e) => e.currentTarget.select()}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-[#DCCBD4] bg-[#FAF5F7] text-xs font-mono text-[#241726] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopySiteUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#9D174D] text-white text-xs font-semibold hover:bg-[#831843] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onTrackSiteShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-xs font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors"
              >
                <span>Facebook-এ শেয়ার</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${siteUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onTrackSiteShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#DCCBD4] bg-white text-xs font-semibold text-[#047857] hover:bg-[#ECFDF5] transition-colors"
              >
                <span>WhatsApp-এ শেয়ার</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#DCCBD4] bg-[#FAF5F7] text-xs font-semibold text-[#241726] hover:bg-[#F3E5EC] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#9D174D]" aria-hidden="true" />
                <span>অন্য মাধ্যমে শেয়ার</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
