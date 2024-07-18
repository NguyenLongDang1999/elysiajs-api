CREATE TABLE IF NOT EXISTS "product-images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"image_uri" text NOT NULL,
	"index" smallint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"product_variant_id" text NOT NULL,
	"quantity" integer,
	CONSTRAINT "product-inventory_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-inventory-transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"product_variant_id" text NOT NULL,
	"product_inventory_id" text NOT NULL,
	"transaction_type" smallint,
	"quantity" integer,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-relations" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"related_product_id" text NOT NULL,
	"relation_type" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_uri" text,
	"short_description" text,
	"description" text,
	"technical_specifications" json,
	"product_category_id" text NOT NULL,
	"product_brand_id" text,
	"status" smallint DEFAULT 20,
	"product_type" smallint DEFAULT 10,
	"price" numeric(18, 0),
	"special_price" numeric(18, 0),
	"special_price_type" smallint,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-variant-attribute-values" (
	"product_variant_id" text NOT NULL,
	"product_attribute_value_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product-variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"label" text,
	"sku" text NOT NULL,
	"manage_inventory" smallint DEFAULT 20,
	"price" numeric(18, 0),
	"special_price" numeric(18, 0),
	"special_price_type" smallint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "product-variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-images" ADD CONSTRAINT "product-images_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-inventory" ADD CONSTRAINT "product-inventory_product_variant_id_product-variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product-variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-inventory-transactions" ADD CONSTRAINT "product-inventory-transactions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-inventory-transactions" ADD CONSTRAINT "product-inventory-transactions_product_variant_id_product-variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product-variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-inventory-transactions" ADD CONSTRAINT "product-inventory-transactions_product_inventory_id_product-inventory_id_fk" FOREIGN KEY ("product_inventory_id") REFERENCES "public"."product-inventory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-relations" ADD CONSTRAINT "product-relations_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-relations" ADD CONSTRAINT "product-relations_related_product_id_product_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_product_category_id_product-category_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product-category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_product_brand_id_product-brand_id_fk" FOREIGN KEY ("product_brand_id") REFERENCES "public"."product-brand"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-variant-attribute-values" ADD CONSTRAINT "product-variant-attribute-values_product_variant_id_product-variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product-variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-variant-attribute-values" ADD CONSTRAINT "product-variant-attribute-values_product_attribute_value_id_product-attribute-values_id_fk" FOREIGN KEY ("product_attribute_value_id") REFERENCES "public"."product-attribute-values"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-variants" ADD CONSTRAINT "product-variants_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
