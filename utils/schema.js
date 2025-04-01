import { pgTable, serial, varchar, text, integer } from "drizzle-orm/pg-core";

export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt").notNull(),
  mockId: varchar("mockId").notNull(),
});

export const UserAnswer = pgTable("userAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  question: varchar("question").notNull(),
  correctAns: text("correctAns"),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: varchar("rating"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  userEmail: varchar("userEmail"),
  createdAt: varchar("createdAt"),
});

export const ReportData = pgTable("reportData", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  userEmail: varchar("userEmail").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  createdAt: varchar("createdAt").notNull(),
  overallScore: integer("overallScore"),
  communicationScore: integer("communicationScore"),
  technicalKnowledgeScore: integer("technicalKnowledgeScore"),
  problemSolvingScore: integer("problemSolvingScore"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  questionCount: integer("questionCount"),
  answeredCount: integer("answeredCount"),
  reportData: text("reportData"), // For any additional JSON data
});
