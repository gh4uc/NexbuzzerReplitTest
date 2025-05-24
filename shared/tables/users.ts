
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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
