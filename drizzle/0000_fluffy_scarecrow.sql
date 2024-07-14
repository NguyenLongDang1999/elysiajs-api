CREATE TABLE IF NOT EXISTS "product-category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"image_uri" text,
	"description" text,
	"status" smallint DEFAULT 20,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "product-category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product-category" ADD CONSTRAINT "product-category_parent_id_product-category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product-category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product-category_status_parent_id_index" ON "product-category" USING btree ("status","parent_id");