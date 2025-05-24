
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'model' | 'admin';
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
  profileImage: string | null;
  walletBalance?: number;
  modelProfile?: ModelProfile;
}

export interface ModelProfile {
  id: number;
  userId: number;
  bio: string | null;
  languages: string[];
  categories: string[];
  offerVoiceCalls: boolean;
  offerVideoCalls: boolean;
  voiceRate: number;
  videoRate: number;
  isAvailable: boolean;
  profileImages: string[];
  isVerified?: boolean;
  commissionRate?: number;
  payoutInfo?: string | null;
  referrerId?: number | null;
}

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  relatedEntityId: number | null;
  createdAt: Date | null;
}

export interface CallSession {
  id: number;
  userId: number;
  modelId: number;
  type: 'voice' | 'video';
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  rate: number;
  totalCost?: number | null;
  twilioRoomId: string;
  twilioRoomToken: string;
  createdAt?: Date | null;
}

export interface ScheduledCall {
  id: number;
  userId: number;
  modelId: number;
  scheduledTime: Date;
  duration: number;
  type: 'voice' | 'video';
  rate: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date | null;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Favorite {
  id: number;
  userId: number;
  modelId: number;
  createdAt: Date;
}

export interface ModelWithFavorite extends User {
  isFavorite?: boolean;
}
