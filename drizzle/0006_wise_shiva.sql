CREATE TABLE IF NOT EXISTS "flash-deal-product" (
	"flash_deal_id" text NOT NULL,
	"product_variants_id" text NOT NULL,
	"price" numeric(18, 0),
	"special_price" numeric(18, 0),
	"special_price_type" smallint,
	"quantity_limit" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flash-deals" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" smallint DEFAULT 20,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "flash-deals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flash-deal-product" ADD CONSTRAINT "flash-deal-product_flash_deal_id_flash-deals_id_fk" FOREIGN KEY ("flash_deal_id") REFERENCES "public"."flash-deals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flash-deal-product" ADD CONSTRAINT "flash-deal-product_product_variants_id_product-variants_id_fk" FOREIGN KEY ("product_variants_id") REFERENCES "public"."product-variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
