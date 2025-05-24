import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { eq, and, or, desc, asc, sql } from "drizzle-orm";

// Export operators from drizzle-orm
export { eq, and, or, desc, asc, sql };

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // user, model, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: text("gender"),
  age: integer("age"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
  profileImage: text("profile_image"),
});

// We'll define relations after all tables are created

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  gender: true,
  age: true,
  city: true,
  country: true,
  profileImage: true,
});

// Wallet Table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: doublePrecision("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // deposit, call_charge, tip, payout, refund
  status: text("status").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  description: text("description"),
  relatedEntityId: integer("related_entity_id"), // call_id or model_id
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  status: true,
  description: true,
  relatedEntityId: true,
});

// Model Profiles Table
export const modelProfiles = pgTable("model_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  bio: text("bio"),
  languages: text("languages").array(),
  categories: text("categories").array(),
  offerVoiceCalls: boolean("offer_voice_calls").default(true),
  offerVideoCalls: boolean("offer_video_calls").default(true),
  voiceRate: doublePrecision("voice_rate").default(4.97),
  videoRate: doublePrecision("video_rate").default(9.97),
  isAvailable: boolean("is_available").default(false),
  isVerified: boolean("is_verified").default(false),
  commissionRate: doublePrecision("commission_rate").default(0.75),
  payoutInfo: text("payout_info"),
  referrerId: integer("referrer_id").references(() => users.id),
  profileImages: text("profile_images").array(),
});

export const insertModelProfileSchema = createInsertSchema(modelProfiles).pick({
  userId: true,
  bio: true,
  languages: true,
  categories: true,
  offerVoiceCalls: true,
  offerVideoCalls: true,
  voiceRate: true,
  videoRate: true,
  isAvailable: true,
  payoutInfo: true,
  referrerId: true,
  profileImages: true,
});

// Call Sessions Table
export const callSessions = pgTable("call_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  modelId: integer("model_id").notNull().references(() => users.id),
  type: text("type").notNull(), // voice, video
  status: text("status").notNull(), // scheduled, active, completed, cancelled, missed
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  rate: doublePrecision("rate").notNull(),
  totalCost: doublePrecision("total_cost"),
  createdAt: timestamp("created_at").defaultNow(),
  twilioRoomId: text("twilio_room_id"),
  twilioRoomToken: text("twilio_room_token"),
});

export const insertCallSessionSchema = createInsertSchema(callSessions).pick({
  userId: true,
  modelId: true,
  type: true,
  status: true,
  startTime: true,
  rate: true,
  twilioRoomId: true,
  twilioRoomToken: true,
});

// Scheduled Calls Table
export const scheduledCalls = pgTable("scheduled_calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  modelId: integer("model_id").notNull().references(() => users.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: text("type").notNull(), // voice, video
  rate: doublePrecision("rate").notNull(),
  status: text("status").notNull(), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
  callSessionId: integer("call_session_id").references(() => callSessions.id),
});

export const insertScheduledCallSchema = createInsertSchema(scheduledCalls).pick({
  userId: true,
  modelId: true,
  scheduledTime: true,
  duration: true,
  type: true,
  rate: true,
  status: true,
});

// Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
  isRead: true,
});

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  modelId: integer("model_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  modelId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type ModelProfile = typeof modelProfiles.$inferSelect;
export type InsertModelProfile = z.infer<typeof insertModelProfileSchema>;

export type CallSession = typeof callSessions.$inferSelect;
export type InsertCallSession = z.infer<typeof insertCallSessionSchema>;

export type ScheduledCall = typeof scheduledCalls.$inferSelect;
export type InsertScheduledCall = z.infer<typeof insertScheduledCallSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Extended types for use with API responses
export type UserWithProfile = User & {
  modelProfile?: ModelProfile;
};
