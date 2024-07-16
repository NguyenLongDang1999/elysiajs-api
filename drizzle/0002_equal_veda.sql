CREATE TABLE IF NOT EXISTS "system-setting-options" (
	"id" text PRIMARY KEY NOT NULL,
	"system_setting_id" text NOT NULL,
	"key" text NOT NULL,
	"displayValue" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system-settings" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"input_type" smallint DEFAULT 20,
	"system_type" smallint,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_flg" boolean DEFAULT false,
	CONSTRAINT "system-settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system-setting-options" ADD CONSTRAINT "system-setting-options_system_setting_id_system-settings_id_fk" FOREIGN KEY ("system_setting_id") REFERENCES "public"."system-settings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
