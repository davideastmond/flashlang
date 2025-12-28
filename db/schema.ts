import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("first_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const flashCards = pgTable("flash_cards", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// FlashCards belong to study sets
export const studySets = pgTable("study_sets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  language: text("language_code").notNull().default("en-US"), // use the IETF language tag format
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Many-to-many relationship between studySets and flashCards
export const studySetFlashCards = pgTable("study_set_flash_cards", {
  studySetId: text("study_set_id")
    .notNull()
    .references(() => studySets.id, { onDelete: "cascade" }),
  flashCardId: text("flash_card_id")
    .notNull()
    .references(() => flashCards.id, { onDelete: "cascade" }),
});

/* 
A study session is a round of going throw a studySet. We
// TODO track number of correct answers, total questions, etc.
*/
export const studySessions = pgTable("study_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studySetId: text("study_set_id")
    .notNull()
    .references(() => studySets.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").defaultNow().notNull(),
  correctCount: integer("correct_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  results: jsonb("results")
    .$type<
      Array<{
        cardId: string;
        userAnswer: string;
        isCorrect: boolean;
        answeredAt: string;
      }>
    >()
    .notNull()
    .default([]),
  endTime: timestamp("end_time"),
});
