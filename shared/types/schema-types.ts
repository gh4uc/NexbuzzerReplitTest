
import { z } from "zod";
import { 
  users, insertUserSchema,
  wallets, insertWalletSchema,
  transactions, insertTransactionSchema,
  modelProfiles, insertModelProfileSchema,
  callSessions, insertCallSessionSchema,
  scheduledCalls, insertScheduledCallSchema,
  messages, insertMessageSchema,
  favorites, insertFavoriteSchema
} from "../tables";

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
