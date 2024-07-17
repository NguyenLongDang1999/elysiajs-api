CREATE TABLE IF NOT EXISTS "product-attribute" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" smallint DEFAULT 20,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "product-attribute_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-category-attribute" (
	"product_attribute_id" text NOT NULL,
	"product_category_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-attribute-values" (
	"id" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"product_attribute_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-category-attribute" ADD CONSTRAINT "product-category-attribute_product_attribute_id_product-attribute_id_fk" FOREIGN KEY ("product_attribute_id") REFERENCES "public"."product-attribute"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-category-attribute" ADD CONSTRAINT "product-category-attribute_product_category_id_product-category_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product-category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-attribute-values" ADD CONSTRAINT "product-attribute-values_product_attribute_id_product-attribute_id_fk" FOREIGN KEY ("product_attribute_id") REFERENCES "public"."product-attribute"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
