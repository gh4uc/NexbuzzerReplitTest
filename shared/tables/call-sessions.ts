
import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./users";

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
