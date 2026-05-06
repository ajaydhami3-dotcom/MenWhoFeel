CREATE TYPE "public"."assessment_category" AS ENUM('thriving', 'stable', 'mild_distress', 'moderate_distress', 'severe_distress');--> statement-breakpoint
CREATE TYPE "public"."challenge_category" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('exercise', 'habit', 'meditation', 'discipline', 'spot_check');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."guide_category" AS ENUM('overcoming_crisis', 'daily_improvement', 'skill_building', 'emotional_regulation', 'relationships', 'productivity', 'physical_health');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userIdentifier" varchar(255) NOT NULL,
	"answers" text NOT NULL,
	"score" integer NOT NULL,
	"category" "assessment_category" NOT NULL,
	"recommendations" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" "challenge_category" NOT NULL,
	"type" "challenge_type" NOT NULL,
	"instructions" text,
	"dayOfWeek" integer,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorName" varchar(255) DEFAULT 'Anonymous' NOT NULL,
	"content" text NOT NULL,
	"status" "status" DEFAULT 'approved' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helplines" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" varchar(255) NOT NULL,
	"countryCode" varchar(10) NOT NULL,
	"organization" varchar(255) NOT NULL,
	"phoneNumber" varchar(50) NOT NULL,
	"description" text,
	"availableHours" varchar(255),
	"website" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "self_help_guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" "guide_category" NOT NULL,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"estimatedMinutes" integer,
	"featured" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"authorName" varchar(255) DEFAULT 'Anonymous' NOT NULL,
	"excerpt" varchar(500),
	"status" "status" DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"storyId" bigint NOT NULL,
	"authorName" varchar(255) DEFAULT 'Anonymous' NOT NULL,
	"content" text NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"challengeId" bigint NOT NULL,
	"userIdentifier" varchar(255) NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"unionId" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"avatar" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
CREATE INDEX "user_identifier_idx" ON "assessments" USING btree ("userIdentifier");--> statement-breakpoint
CREATE INDEX "category_idx" ON "challenges" USING btree ("category");--> statement-breakpoint
CREATE INDEX "active_idx" ON "challenges" USING btree ("active");--> statement-breakpoint
CREATE INDEX "chat_created_at_idx" ON "chat_messages" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "chat_status_idx" ON "chat_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "country_idx" ON "helplines" USING btree ("country");--> statement-breakpoint
CREATE INDEX "guide_category_idx" ON "self_help_guides" USING btree ("category");--> statement-breakpoint
CREATE INDEX "status_idx" ON "stories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "stories" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "story_id_idx" ON "story_comments" USING btree ("storyId");--> statement-breakpoint
CREATE INDEX "user_challenge_idx" ON "user_challenges" USING btree ("userIdentifier","challengeId");