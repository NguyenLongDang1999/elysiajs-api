CREATE TABLE IF NOT EXISTS "product-brand" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_uri" text,
	"description" text,
	"status" smallint DEFAULT 20,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "product-brand_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-category-brand" (
	"product_brand_id" text NOT NULL,
	"product_category_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-category-brand" ADD CONSTRAINT "product-category-brand_product_brand_id_product-brand_id_fk" FOREIGN KEY ("product_brand_id") REFERENCES "public"."product-brand"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-category-brand" ADD CONSTRAINT "product-category-brand_product_category_id_product-category_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product-category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
