import {
  User, InsertUser, Wallet, InsertWallet, Transaction, InsertTransaction,
  ModelProfile, InsertModelProfile, CallSession, InsertCallSession,
  ScheduledCall, InsertScheduledCall, Message, InsertMessage, Favorite, InsertFavorite,
  UserWithProfile
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUserWithProfile(id: number): Promise<UserWithProfile | undefined>;
  
  // Wallet methods
  getWallet(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // ModelProfile methods
  getModelProfile(userId: number): Promise<ModelProfile | undefined>;
  createModelProfile(profile: InsertModelProfile): Promise<ModelProfile>;
  updateModelProfile(userId: number, profile: Partial<ModelProfile>): Promise<ModelProfile | undefined>;
  getAllModels(filters?: Partial<ModelProfile>): Promise<(ModelProfile & { user: User })[]>;
  
  // CallSession methods
  getCallSession(id: number): Promise<CallSession | undefined>;
  getCallSessionsByUser(userId: number): Promise<CallSession[]>;
  getCallSessionsByModel(modelId: number): Promise<CallSession[]>;
  createCallSession(session: InsertCallSession): Promise<CallSession>;
  updateCallSession(id: number, session: Partial<CallSession>): Promise<CallSession | undefined>;
  
  // ScheduledCall methods
  getScheduledCall(id: number): Promise<ScheduledCall | undefined>;
  getScheduledCallsByUser(userId: number): Promise<ScheduledCall[]>;
  getScheduledCallsByModel(modelId: number): Promise<ScheduledCall[]>;
  createScheduledCall(scheduledCall: InsertScheduledCall): Promise<ScheduledCall>;
  updateScheduledCall(id: number, scheduledCall: Partial<ScheduledCall>): Promise<ScheduledCall | undefined>;
  
  // Message methods
  getMessages(senderId: number, receiverId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Favorite methods
  getFavorites(userId: number): Promise<(Favorite & { model: User & { modelProfile: ModelProfile } })[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, modelId: number): Promise<boolean>;
  isFavorite(userId: number, modelId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private modelProfiles: Map<number, ModelProfile>;
  private callSessions: Map<number, CallSession>;
  private scheduledCalls: Map<number, ScheduledCall>;
  private messages: Map<number, Message>;
  private favorites: Map<number, Favorite>;
  
  private userIdCounter: number;
  private walletIdCounter: number;
  private transactionIdCounter: number;
  private modelProfileIdCounter: number;
  private callSessionIdCounter: number;
  private scheduledCallIdCounter: number;
  private messageIdCounter: number;
  private favoriteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.modelProfiles = new Map();
    this.callSessions = new Map();
    this.scheduledCalls = new Map();
    this.messages = new Map();
    this.favorites = new Map();
    
    this.userIdCounter = 1;
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.modelProfileIdCounter = 1;
    this.callSessionIdCounter = 1;
    this.scheduledCallIdCounter = 1;
    this.messageIdCounter = 1;
    this.favoriteIdCounter = 1;
    
    // Initialize with sample data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserWithProfile(id: number): Promise<UserWithProfile | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const modelProfile = await this.getModelProfile(id);
    return { ...user, modelProfile };
  }

  // Wallet methods
  async getWallet(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const updatedAt = new Date();
    const wallet: Wallet = { ...insertWallet, id, updatedAt };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const updatedWallet: Wallet = {
      ...wallet,
      balance: wallet.balance + amount,
      updatedAt: new Date()
    };
    
    this.wallets.set(wallet.id, updatedWallet);
    return updatedWallet;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const createdAt = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // ModelProfile methods
  async getModelProfile(userId: number): Promise<ModelProfile | undefined> {
    return Array.from(this.modelProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createModelProfile(insertProfile: InsertModelProfile): Promise<ModelProfile> {
    const id = this.modelProfileIdCounter++;
    const profile: ModelProfile = { ...insertProfile, id };
    this.modelProfiles.set(id, profile);
    return profile;
  }

  async updateModelProfile(userId: number, updateData: Partial<ModelProfile>): Promise<ModelProfile | undefined> {
    const profile = await this.getModelProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updateData };
    this.modelProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getAllModels(filters?: Partial<ModelProfile>): Promise<(ModelProfile & { user: User })[]> {
    let profiles = Array.from(this.modelProfiles.values());
    
    // Apply filters if provided
    if (filters) {
      if (filters.isAvailable !== undefined) {
        profiles = profiles.filter(p => p.isAvailable === filters.isAvailable);
      }
      
      if (filters.offerVoiceCalls !== undefined) {
        profiles = profiles.filter(p => p.offerVoiceCalls === filters.offerVoiceCalls);
      }
      
      if (filters.offerVideoCalls !== undefined) {
        profiles = profiles.filter(p => p.offerVideoCalls === filters.offerVideoCalls);
      }
      
      if (filters.languages && filters.languages.length > 0) {
        profiles = profiles.filter(p => 
          p.languages?.some(lang => filters.languages?.includes(lang))
        );
      }
      
      if (filters.categories && filters.categories.length > 0) {
        profiles = profiles.filter(p => 
          p.categories?.some(cat => filters.categories?.includes(cat))
        );
      }
    }
    
    // Join with user data
    return profiles.map(profile => {
      const user = this.users.get(profile.userId);
      if (!user) throw new Error(`User not found for profile: ${profile.id}`);
      return { ...profile, user };
    });
  }

  // CallSession methods
  async getCallSession(id: number): Promise<CallSession | undefined> {
    return this.callSessions.get(id);
  }

  async getCallSessionsByUser(userId: number): Promise<CallSession[]> {
    return Array.from(this.callSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getCallSessionsByModel(modelId: number): Promise<CallSession[]> {
    return Array.from(this.callSessions.values()).filter(
      (session) => session.modelId === modelId
    );
  }

  async createCallSession(insertSession: InsertCallSession): Promise<CallSession> {
    const id = this.callSessionIdCounter++;
    const createdAt = new Date();
    const session: CallSession = { 
      ...insertSession, 
      id, 
      createdAt,
      endTime: undefined,
      duration: undefined,
      totalCost: undefined
    };
    this.callSessions.set(id, session);
    return session;
  }

  async updateCallSession(id: number, updateData: Partial<CallSession>): Promise<CallSession | undefined> {
    const session = this.callSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updateData };
    this.callSessions.set(id, updatedSession);
    return updatedSession;
  }

  // ScheduledCall methods
  async getScheduledCall(id: number): Promise<ScheduledCall | undefined> {
    return this.scheduledCalls.get(id);
  }

  async getScheduledCallsByUser(userId: number): Promise<ScheduledCall[]> {
    return Array.from(this.scheduledCalls.values()).filter(
      (call) => call.userId === userId
    );
  }

  async getScheduledCallsByModel(modelId: number): Promise<ScheduledCall[]> {
    return Array.from(this.scheduledCalls.values()).filter(
      (call) => call.modelId === modelId
    );
  }

  async createScheduledCall(insertScheduledCall: InsertScheduledCall): Promise<ScheduledCall> {
    const id = this.scheduledCallIdCounter++;
    const createdAt = new Date();
    const scheduledCall: ScheduledCall = { 
      ...insertScheduledCall, 
      id, 
      createdAt,
      callSessionId: undefined
    };
    this.scheduledCalls.set(id, scheduledCall);
    return scheduledCall;
  }

  async updateScheduledCall(id: number, updateData: Partial<ScheduledCall>): Promise<ScheduledCall | undefined> {
    const scheduledCall = this.scheduledCalls.get(id);
    if (!scheduledCall) return undefined;
    
    const updatedScheduledCall = { ...scheduledCall, ...updateData };
    this.scheduledCalls.set(id, updatedScheduledCall);
    return updatedScheduledCall;
  }

  // Message methods
  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === senderId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === senderId)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const message: Message = { ...insertMessage, id, createdAt };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Favorite methods
  async getFavorites(userId: number): Promise<(Favorite & { model: User & { modelProfile: ModelProfile } })[]> {
    const favorites = Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
    
    return favorites.map(favorite => {
      const model = this.users.get(favorite.modelId);
      if (!model) throw new Error(`Model not found for favorite: ${favorite.id}`);
      
      const modelProfile = Array.from(this.modelProfiles.values()).find(
        (profile) => profile.userId === favorite.modelId
      );
      
      if (!modelProfile) throw new Error(`Model profile not found for model: ${favorite.modelId}`);
      
      return { 
        ...favorite, 
        model: { 
          ...model, 
          modelProfile 
        } 
      };
    });
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const createdAt = new Date();
    const favorite: Favorite = { ...insertFavorite, id, createdAt };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(userId: number, modelId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.modelId === modelId
    );
    
    if (!favorite) return false;
    
    return this.favorites.delete(favorite.id);
  }

  async isFavorite(userId: number, modelId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.modelId === modelId
    );
  }

  // Initialize with sample data
  private async seedData() {
    // Create sample users
    const admin = await this.createUser({
      username: "admin",
      password: "admin123", // This would be hashed in a real application
      email: "admin@nexbuzzer.com",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      gender: "other",
      age: 30,
      city: "New York",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    });

    const user1 = await this.createUser({
      username: "user1",
      password: "password123", // This would be hashed in a real application
      email: "user1@example.com",
      role: "user",
      firstName: "Tom",
      lastName: "Cook",
      gender: "male",
      age: 28,
      city: "Chicago",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg"
    });

    // Create models
    const model1 = await this.createUser({
      username: "jessica",
      password: "model123", // This would be hashed in a real application
      email: "jessica@example.com",
      role: "model",
      firstName: "Jessica",
      lastName: "Smith",
      gender: "female",
      age: 28,
      city: "New York",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/women/3.jpg"
    });

    const model2 = await this.createUser({
      username: "michael",
      password: "model123", // This would be hashed in a real application
      email: "michael@example.com",
      role: "model",
      firstName: "Michael",
      lastName: "Johnson",
      gender: "male",
      age: 32,
      city: "Chicago",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/4.jpg"
    });

    const model3 = await this.createUser({
      username: "samantha",
      password: "model123", // This would be hashed in a real application
      email: "samantha@example.com",
      role: "model",
      firstName: "Samantha",
      lastName: "Williams",
      gender: "female",
      age: 26,
      city: "Miami",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/women/5.jpg"
    });

    // Create wallets
    await this.createWallet({
      userId: user1.id,
      balance: 49.70
    });

    await this.createWallet({
      userId: model1.id,
      balance: 0
    });

    await this.createWallet({
      userId: model2.id,
      balance: 0
    });

    await this.createWallet({
      userId: model3.id,
      balance: 0
    });

    // Create model profiles
    await this.createModelProfile({
      userId: model1.id,
      bio: "Passionate conversationalist with a background in psychology. I love deep discussions about life, relationships, and personal growth.",
      languages: ["English", "Spanish"],
      categories: ["Psychology"],
      offerVoiceCalls: true,
      offerVideoCalls: true,
      voiceRate: 4.97,
      videoRate: 9.97,
      isAvailable: true,
      payoutInfo: "paypal:jessica@example.com",
      profileImages: ["https://randomuser.me/api/portraits/women/3.jpg"]
    });

    await this.createModelProfile({
      userId: model2.id,
      bio: "Tech enthusiast and musician. Let's talk about the latest gadgets, music theory, or just have a fun conversation about life.",
      languages: ["English"],
      categories: ["Technology", "Music"],
      offerVoiceCalls: true,
      offerVideoCalls: false,
      voiceRate: 4.97,
      videoRate: 9.97,
      isAvailable: false,
      payoutInfo: "paypal:michael@example.com",
      profileImages: ["https://randomuser.me/api/portraits/men/4.jpg"]
    });

    await this.createModelProfile({
      userId: model3.id,
      bio: "Yoga instructor and wellness coach. I can help you with meditation techniques, stress management, or just provide a listening ear.",
      languages: ["English"],
      categories: ["Wellness", "Yoga"],
      offerVoiceCalls: true,
      offerVideoCalls: true,
      voiceRate: 4.97,
      videoRate: 9.97,
      isAvailable: true,
      payoutInfo: "paypal:samantha@example.com",
      profileImages: ["https://randomuser.me/api/portraits/women/5.jpg"]
    });

    // Create a sample favorite
    await this.createFavorite({
      userId: user1.id,
      modelId: model3.id
    });
  }
}

import { DatabaseStorage } from './storage-db';

// Use the database storage implementation instead of memory storage
export const storage = new DatabaseStorage();
