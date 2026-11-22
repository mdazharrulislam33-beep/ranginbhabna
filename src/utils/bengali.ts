const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)] ?? d);
}

export function formatBengaliDate(isoStr: string): string {
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return 'আজকের গল্প';
  const day = toBengaliNumber(date.getDate());
  const month = BENGALI_MONTHS[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  return `${day} ${month} ${year}`;
}

export function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 130));
  return `${toBengaliNumber(mins)} মিনিট পাঠ`;
}

export function makeFallbackCoverSvg(title: string, color1 = '#FBCFE8', color2 = '#9D174D'): string {
  const safeTitle = title.replace(/[<>&"']/g, '').slice(0, 42);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      <circle cx="150" cy="120" r="130" fill="#ffffff" fill-opacity="0.16" />
      <circle cx="660" cy="470" r="170" fill="#ffffff" fill-opacity="0.14" />
      <rect x="72" y="72" width="656" height="456" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2" />
      <text x="400" y="305" font-family="serif" font-size="32" fill="#ffffff" text-anchor="middle" opacity="0.92">${safeTitle}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
