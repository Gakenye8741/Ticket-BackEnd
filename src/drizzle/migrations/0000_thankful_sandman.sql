CREATE TYPE "public"."bookingStatus" AS ENUM('Pending', 'Confirmed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."eventStatus" AS ENUM('in_progress', 'ended', 'cancelled', 'upcoming');--> statement-breakpoint
CREATE TYPE "public"."mediaType" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Open', 'In Progress', 'Resolved', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."venueStatus" AS ENUM('available', 'booked');--> statement-breakpoint
CREATE TABLE "bookings" (
	"bookingId" serial PRIMARY KEY NOT NULL,
	"nationalId" integer,
	"eventId" integer,
	"ticketTypeId" integer,
	"ticketTypeName" varchar(100),
	"quantity" integer NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"bookingStatus" "bookingStatus" DEFAULT 'Pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"eventId" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"venueId" integer,
	"category" varchar(100),
	"date" date NOT NULL,
	"time" time NOT NULL,
	"ticketPrice" numeric(10, 2) NOT NULL,
	"ticketsTotal" integer NOT NULL,
	"ticketsSold" integer DEFAULT 0,
	"eventStatus" "eventStatus" DEFAULT 'in_progress' NOT NULL,
	"cancellationPolicy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"mediaId" serial PRIMARY KEY NOT NULL,
	"eventId" integer,
	"venueId" integer,
	"url" varchar(500) NOT NULL,
	"type" "mediaType" NOT NULL,
	"altText" varchar(255),
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"paymentId" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"nationalId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paymentStatus" "paymentStatus" DEFAULT 'Pending' NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50),
	"transactionId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"responseId" serial PRIMARY KEY NOT NULL,
	"ticketId" integer NOT NULL,
	"nationalId" integer NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supportTickets" (
	"ticketId" serial PRIMARY KEY NOT NULL,
	"nationalId" integer,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "status" DEFAULT 'Open' NOT NULL,
	"priority" "priority" DEFAULT 'Medium' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticketTypes" (
	"ticketTypeId" serial PRIMARY KEY NOT NULL,
	"eventId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"sold" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"nationalId" integer PRIMARY KEY NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"confirmationCode" varchar(255) DEFAULT '',
	"password" varchar(255) NOT NULL,
	"contactPhone" varchar(20),
	"address" text,
	"profileImageUrl" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"venueId" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"capacity" integer NOT NULL,
	"status" "venueStatus" DEFAULT 'available' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_nationalId_users_nationalId_fk" FOREIGN KEY ("nationalId") REFERENCES "public"."users"("nationalId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_eventId_events_eventId_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("eventId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticketTypeId_ticketTypes_ticketTypeId_fk" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."ticketTypes"("ticketTypeId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_venues_venueId_fk" FOREIGN KEY ("venueId") REFERENCES "public"."venues"("venueId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_eventId_events_eventId_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("eventId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_venueId_venues_venueId_fk" FOREIGN KEY ("venueId") REFERENCES "public"."venues"("venueId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_nationalId_users_nationalId_fk" FOREIGN KEY ("nationalId") REFERENCES "public"."users"("nationalId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_ticketId_supportTickets_ticketId_fk" FOREIGN KEY ("ticketId") REFERENCES "public"."supportTickets"("ticketId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_nationalId_users_nationalId_fk" FOREIGN KEY ("nationalId") REFERENCES "public"."users"("nationalId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supportTickets" ADD CONSTRAINT "supportTickets_nationalId_users_nationalId_fk" FOREIGN KEY ("nationalId") REFERENCES "public"."users"("nationalId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticketTypes" ADD CONSTRAINT "ticketTypes_eventId_events_eventId_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("eventId") ON DELETE cascade ON UPDATE no action;