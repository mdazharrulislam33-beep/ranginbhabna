export type CategoryId = 'love' | 'sad' | 'funny' | 'life' | 'real' | 'islamic';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  shortLabel: string;
  accentHex: string;
  softBgHex: string;
  presetImage: string;
}

export interface Story {
  id: string;
  title: string;
  category: CategoryId;
  author: string;
  date: string;
  image: string;
  featured: boolean;
  status: 'published' | 'pending';
  likes: number;
  views: number;
  shares: number;
  content: string;
}

export interface StoryComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface MessageReply {
  id: string;
  text: string;
  date: string;
  sender: 'admin' | 'reader';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: 'unread' | 'replied';
  replies: MessageReply[];
}

export interface MonetizationSettings {
  adsEnabled: boolean;
  adsenseId: string;
  sponsorTitle: string;
  sponsorDescription: string;
  sponsorUrl: string;
  sponsorButtonText: string;
  adImpressions: number;
  adClicks: number;
  supportEnabled: boolean;
  supportHeading: string;
  supportMessage: string;
  bkashNumber: string;
  nagadNumber: string;
  supportLink: string;
  rpmPer1000Views: number;
  ratePerShare: number;
  ratePerAdClick: number;
  siteShares: number;
}

export type ViewMode = 'home' | 'reader' | 'admin';
export type AdminTab =
  | 'editor'
  | 'stories'
  | 'comments'
  | 'messages'
  | 'monetization'
  | 'security';
export type ReaderTheme = 'paper' | 'warm' | 'blush';
export type InfoModalType = 'about' | 'contact' | 'facebook' | 'share' | null;

export interface AdminCredentials {
  username: string;
  password: string;
}
