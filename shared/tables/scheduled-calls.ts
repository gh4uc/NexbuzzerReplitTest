
import { pgTable, serial, integer, timestamp, text, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./users";
import { callSessions } from "./call-sessions";

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
