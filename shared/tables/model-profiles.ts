
import { pgTable, text, serial, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./users";

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
