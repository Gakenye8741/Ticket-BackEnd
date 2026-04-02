ALTER TYPE "public"."paymentStatus" ADD VALUE 'Paid';--> statement-breakpoint
CREATE TABLE "mpesa_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"checkout_request_id" text,
	"raw_response" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "paymentMethod" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "checkout_request_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_checkout_request_id_unique" UNIQUE("checkout_request_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_unique" UNIQUE("transactionId");