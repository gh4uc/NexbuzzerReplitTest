import { sql } from 'drizzle-orm';
import { db } from './db';
import {
  User, InsertUser, Wallet, InsertWallet, Transaction, InsertTransaction,
  ModelProfile, InsertModelProfile, CallSession, InsertCallSession,
  ScheduledCall, InsertScheduledCall, Message, InsertMessage, Favorite, InsertFavorite,
  UserWithProfile, users, wallets, transactions, modelProfiles, callSessions, 
  scheduledCalls, messages, favorites, eq, and, or, desc, asc
} from "@shared/schema";

import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date(),
    }).returning();
    
    // Create wallet for user
    if (insertUser.role === "user") {
      await db.insert(wallets).values({
        userId: user.id,
        balance: 0,
        updatedAt: new Date(),
      });
    }
    
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }
  
  async getUserWithProfile(id: number): Promise<UserWithProfile | undefined> {
    const user = await this.getUser(id);
    
    if (!user) {
      return undefined;
    }
    
    if (user.role === "model") {
      const modelProfile = await this.getModelProfile(id);
      return { ...user, modelProfile };
    }
    
    return user;
  }
  
  async getWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    return wallet || undefined;
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets)
      .values({
        ...insertWallet,
        updatedAt: new Date(),
      })
      .returning();
    
    return wallet;
  }
  
  async updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const [updatedWallet] = await db.update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId))
      .returning();
    
    return updatedWallet || undefined;
  }
  
  async getTransactions(userId: number): Promise<Transaction[]> {
    const result = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    return result;
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions)
      .values({
        ...insertTransaction,
        createdAt: new Date(),
      })
      .returning();
    
    return transaction;
  }
  
  async getModelProfile(userId: number): Promise<ModelProfile | undefined> {
    const [profile] = await db.select()
      .from(modelProfiles)
      .where(eq(modelProfiles.userId, userId));
    
    return profile || undefined;
  }
  
  async createModelProfile(insertProfile: InsertModelProfile): Promise<ModelProfile> {
    const defaults = {
      isVerified: false,
      commissionRate: 0.7,
    };
    
    const [profile] = await db.insert(modelProfiles)
      .values({
        ...insertProfile,
        ...defaults
      })
      .returning();
    
    return profile;
  }
  
  async updateModelProfile(userId: number, updateData: Partial<ModelProfile>): Promise<ModelProfile | undefined> {
    const [updatedProfile] = await db.update(modelProfiles)
      .set(updateData)
      .where(eq(modelProfiles.userId, userId))
      .returning();
    
    return updatedProfile || undefined;
  }
  
  async getAllModels(filters?: Partial<ModelProfile>): Promise<(ModelProfile & { user: User })[]> {
    // Build conditions array
    const conditions = [];
    
    if (filters) {
      if (filters.isAvailable !== undefined) {
        conditions.push(sql`${modelProfiles.isAvailable} = ${filters.isAvailable}`);
      }
      
      if (filters.offerVoiceCalls !== undefined) {
        conditions.push(sql`${modelProfiles.offerVoiceCalls} = ${filters.offerVoiceCalls}`);
      }
      
      if (filters.offerVideoCalls !== undefined) {
        conditions.push(sql`${modelProfiles.offerVideoCalls} = ${filters.offerVideoCalls}`);
      }
    }
    
    // Build where clause
    let whereClause = sql`TRUE`;
    if (conditions.length > 0) {
      whereClause = sql`${conditions.join(' AND ')}`;
    }
    
    // Query for profiles with users
    const profiles = await db.select({
      profile: modelProfiles,
      user: users
    })
    .from(modelProfiles)
    .innerJoin(users, eq(modelProfiles.userId, users.id))
    .where(whereClause);
    
    // Format result to match expected type
    return profiles.map(({ profile, user }) => ({
      ...profile,
      user
    }));
  }
  
  async getCallSession(id: number): Promise<CallSession | undefined> {
    const [session] = await db.select()
      .from(callSessions)
      .where(eq(callSessions.id, id));
    
    return session || undefined;
  }
  
  async getCallSessionsByUser(userId: number): Promise<CallSession[]> {
    // Get sessions
    const sessions = await db.select({
      session: callSessions,
      model: {
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage
      }
    })
    .from(callSessions)
    .innerJoin(users, eq(callSessions.modelId, users.id))
    .where(eq(callSessions.userId, userId))
    .orderBy(desc(callSessions.startTime));
    
    // Format result
    return sessions.map(({ session, model }) => ({
      ...session,
      model
    }));
  }
  
  async getCallSessionsByModel(modelId: number): Promise<CallSession[]> {
    // Get sessions
    const sessions = await db.select({
      session: callSessions,
      user: {
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage
      }
    })
    .from(callSessions)
    .innerJoin(users, eq(callSessions.userId, users.id))
    .where(eq(callSessions.modelId, modelId))
    .orderBy(desc(callSessions.startTime));
    
    // Format result
    return sessions.map(({ session, user }) => ({
      ...session,
      user
    }));
  }
  
  async createCallSession(insertSession: InsertCallSession): Promise<CallSession> {
    const [session] = await db.insert(callSessions)
      .values({
        userId: insertSession.userId,
        modelId: insertSession.modelId,
        type: insertSession.type,
        status: insertSession.status || "active",
        rate: insertSession.rate,
        startTime: insertSession.startTime || new Date(),
        twilioRoomId: insertSession.twilioRoomId || null,
        twilioRoomToken: insertSession.twilioRoomToken || null,
        endTime: null,
        duration: 0,
        totalCost: 0,
        createdAt: new Date()
      })
      .returning();
    
    return session;
  }
  
  async updateCallSession(id: number, updateData: Partial<CallSession>): Promise<CallSession | undefined> {
    const [updatedSession] = await db.update(callSessions)
      .set(updateData)
      .where(eq(callSessions.id, id))
      .returning();
    
    return updatedSession || undefined;
  }
  
  async getScheduledCall(id: number): Promise<ScheduledCall | undefined> {
    const [call] = await db.select()
      .from(scheduledCalls)
      .where(eq(scheduledCalls.id, id));
    
    return call || undefined;
  }
  
  async getScheduledCallsByUser(userId: number): Promise<ScheduledCall[]> {
    // Get scheduled calls
    const calls = await db.select({
      call: scheduledCalls,
      model: {
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage
      }
    })
    .from(scheduledCalls)
    .innerJoin(users, eq(scheduledCalls.modelId, users.id))
    .where(eq(scheduledCalls.userId, userId))
    .orderBy(asc(scheduledCalls.scheduledTime));
    
    // Format result
    return calls.map(({ call, model }) => ({
      ...call,
      model
    }));
  }
  
  async getScheduledCallsByModel(modelId: number): Promise<ScheduledCall[]> {
    // Get scheduled calls
    const calls = await db.select({
      call: scheduledCalls,
      user: {
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage
      }
    })
    .from(scheduledCalls)
    .innerJoin(users, eq(scheduledCalls.userId, users.id))
    .where(eq(scheduledCalls.modelId, modelId))
    .orderBy(asc(scheduledCalls.scheduledTime));
    
    // Format result
    return calls.map(({ call, user }) => ({
      ...call,
      user
    }));
  }
  
  async createScheduledCall(insertScheduledCall: InsertScheduledCall): Promise<ScheduledCall> {
    const [scheduledCall] = await db.insert(scheduledCalls)
      .values({
        userId: insertScheduledCall.userId,
        modelId: insertScheduledCall.modelId,
        scheduledTime: insertScheduledCall.scheduledTime,
        duration: insertScheduledCall.duration,
        type: insertScheduledCall.type,
        rate: insertScheduledCall.rate,
        status: insertScheduledCall.status || "pending",
        callSessionId: null,
        createdAt: new Date()
      })
      .returning();
    
    return scheduledCall;
  }
  
  async updateScheduledCall(id: number, updateData: Partial<ScheduledCall>): Promise<ScheduledCall | undefined> {
    const [updatedCall] = await db.update(scheduledCalls)
      .set(updateData)
      .where(eq(scheduledCalls.id, id))
      .returning();
    
    return updatedCall || undefined;
  }
  
  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    const result = await db.select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, senderId),
            eq(messages.receiverId, receiverId)
          ),
          and(
            eq(messages.senderId, receiverId),
            eq(messages.receiverId, senderId)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
    
    return result;
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages)
      .values({
        ...insertMessage,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    
    return updatedMessage || undefined;
  }
  
  async getFavorites(userId: number): Promise<(Favorite & { model: User & { modelProfile: ModelProfile } })[]> {
    // Get favorites with users and profiles
    const result = await db.select({
      favorite: favorites,
      modelUser: users,
      modelProfile: modelProfiles
    })
    .from(favorites)
    .innerJoin(users, eq(favorites.modelId, users.id))
    .innerJoin(modelProfiles, eq(favorites.modelId, modelProfiles.userId))
    .where(eq(favorites.userId, userId));
    
    // Format result
    return result.map(({ favorite, modelUser, modelProfile }) => ({
      ...favorite,
      model: {
        ...modelUser,
        modelProfile
      }
    }));
  }
  
  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites)
      .values({
        ...insertFavorite,
        createdAt: new Date()
      })
      .returning();
    
    return favorite;
  }
  
  async deleteFavorite(userId: number, modelId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.modelId, modelId)
        )
      );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async isFavorite(userId: number, modelId: number): Promise<boolean> {
    const [result] = await db.select({ count: sql`count(*)` })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.modelId, modelId)
        )
      );
    
    return result && Number(result.count) > 0;
  }
}