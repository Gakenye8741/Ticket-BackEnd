CREATE TABLE "tickets" (
	"ticketId" serial PRIMARY KEY NOT NULL,
	"nationalId" integer NOT NULL,
	"bookingId" integer NOT NULL,
	"eventId" integer NOT NULL,
	"ticketToken" varchar(255) NOT NULL,
	"isScanned" boolean DEFAULT false NOT NULL,
	"scannedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticketToken_unique" UNIQUE("ticketToken")
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_nationalId_users_nationalId_fk" FOREIGN KEY ("nationalId") REFERENCES "public"."users"("nationalId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_eventId_events_eventId_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("eventId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "token_idx" ON "tickets" USING btree ("ticketToken");