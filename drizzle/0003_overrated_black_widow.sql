ALTER TABLE "study_sessions" RENAME COLUMN "started_at" TO "start_time";--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "correct_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "total_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "percentage" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "results" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "study_sessions" DROP COLUMN "ended_at";