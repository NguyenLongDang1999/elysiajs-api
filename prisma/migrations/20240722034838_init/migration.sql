-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "image_uri" VARCHAR,
    "description" VARCHAR,
    "parent_id" TEXT,
    "status" SMALLINT DEFAULT 20,
    "meta_title" VARCHAR,
    "meta_description" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBrand" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "image_uri" VARCHAR,
    "description" VARCHAR,
    "status" SMALLINT DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategoryBrand" (
    "product_brand_id" TEXT NOT NULL,
    "product_category_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" VARCHAR,
    "status" SMALLINT DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValues" (
    "id" TEXT NOT NULL,
    "value" VARCHAR NOT NULL,
    "product_attribute_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductAttributeValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategoryAttributes" (
    "product_category_id" TEXT NOT NULL,
    "product_attribute_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductCollection" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "status" SMALLINT DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCollectionProduct" (
    "product_id" TEXT NOT NULL,
    "product_collection_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "image_uri" VARCHAR,
    "short_description" VARCHAR,
    "description" TEXT,
    "technical_specifications" JSONB,
    "product_category_id" TEXT NOT NULL,
    "product_brand_id" TEXT,
    "status" SMALLINT DEFAULT 20,
    "product_type" SMALLINT DEFAULT 10,
    "price" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "special_price" DECIMAL(18,0) DEFAULT 0,
    "special_price_type" SMALLINT,
    "meta_title" VARCHAR,
    "meta_description" VARCHAR,
    "total_rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "label" VARCHAR,
    "sku" VARCHAR NOT NULL,
    "manage_inventory" SMALLINT DEFAULT 20,
    "price" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "special_price" DECIMAL(18,0) DEFAULT 0,
    "special_price_type" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductVariants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantAttributeValues" (
    "product_variant_id" TEXT NOT NULL,
    "product_attribute_value_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductImages" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "image_uri" VARCHAR NOT NULL,
    "index" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInventory" (
    "id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInventoryTransactions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "product_variant_id" TEXT NOT NULL,
    "product_inventory_id" TEXT NOT NULL,
    "transaction_type" SMALLINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProductInventoryTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRelations" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "related_product_id" TEXT NOT NULL,
    "relation_type" SMALLINT NOT NULL,

    CONSTRAINT "ProductRelations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDeals" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" VARCHAR,
    "status" SMALLINT DEFAULT 10,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FlashDeals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDealProducts" (
    "flash_deal_id" TEXT NOT NULL,
    "product_variants_id" TEXT NOT NULL,
    "price" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "special_price" DECIMAL(18,0) DEFAULT 0,
    "special_price_type" SMALLINT,
    "quantity_limit" INTEGER DEFAULT 0
);

-- CreateTable
CREATE TABLE "Admins" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "job" VARCHAR,
    "gender" SMALLINT,
    "address" VARCHAR,
    "refresh_token" VARCHAR,
    "role" SMALLINT NOT NULL,
    "image_uri" VARCHAR,
    "status" SMALLINT DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "label" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "value" TEXT,
    "input_type" SMALLINT DEFAULT 10,
    "system_type" SMALLINT,
    "description" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettingOptions" (
    "id" TEXT NOT NULL,
    "system_setting_id" TEXT NOT NULL,
    "key" VARCHAR NOT NULL,
    "displayValue" VARCHAR NOT NULL,
    "sort_order" INTEGER,

    CONSTRAINT "SystemSettingOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- CreateIndex
CREATE INDEX "ProductCategory_status_parent_id_idx" ON "ProductCategory"("status", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBrand_slug_key" ON "ProductBrand"("slug");

-- CreateIndex
CREATE INDEX "ProductBrand_status_idx" ON "ProductBrand"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryBrand_product_brand_id_product_category_id_key" ON "ProductCategoryBrand"("product_brand_id", "product_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_slug_key" ON "ProductAttribute"("slug");

-- CreateIndex
CREATE INDEX "ProductAttribute_status_idx" ON "ProductAttribute"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryAttributes_product_category_id_product_attri_key" ON "ProductCategoryAttributes"("product_category_id", "product_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCollection_slug_key" ON "ProductCollection"("slug");

-- CreateIndex
CREATE INDEX "ProductCollection_status_idx" ON "ProductCollection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCollectionProduct_product_id_product_collection_id_key" ON "ProductCollectionProduct"("product_id", "product_collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariants_sku_key" ON "ProductVariants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantAttributeValues_product_variant_id_product_at_key" ON "ProductVariantAttributeValues"("product_variant_id", "product_attribute_value_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInventory_product_variant_id_key" ON "ProductInventory"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "FlashDeals_slug_key" ON "FlashDeals"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FlashDealProducts_flash_deal_id_product_variants_id_key" ON "FlashDealProducts"("flash_deal_id", "product_variants_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_email_key" ON "Admins"("email");

-- CreateIndex
CREATE INDEX "Admins_status_role_gender_idx" ON "Admins"("status", "role", "gender");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettingOptions_system_setting_id_key_key" ON "SystemSettingOptions"("system_setting_id", "key");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryBrand" ADD CONSTRAINT "ProductCategoryBrand_product_brand_id_fkey" FOREIGN KEY ("product_brand_id") REFERENCES "ProductBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryBrand" ADD CONSTRAINT "ProductCategoryBrand_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValues" ADD CONSTRAINT "ProductAttributeValues_product_attribute_id_fkey" FOREIGN KEY ("product_attribute_id") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryAttributes" ADD CONSTRAINT "ProductCategoryAttributes_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryAttributes" ADD CONSTRAINT "ProductCategoryAttributes_product_attribute_id_fkey" FOREIGN KEY ("product_attribute_id") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollectionProduct" ADD CONSTRAINT "ProductCollectionProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollectionProduct" ADD CONSTRAINT "ProductCollectionProduct_product_collection_id_fkey" FOREIGN KEY ("product_collection_id") REFERENCES "ProductCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_product_brand_id_fkey" FOREIGN KEY ("product_brand_id") REFERENCES "ProductBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariants" ADD CONSTRAINT "ProductVariants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValues" ADD CONSTRAINT "ProductVariantAttributeValues_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValues" ADD CONSTRAINT "ProductVariantAttributeValues_product_attribute_value_id_fkey" FOREIGN KEY ("product_attribute_value_id") REFERENCES "ProductAttributeValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventoryTransactions" ADD CONSTRAINT "ProductInventoryTransactions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventoryTransactions" ADD CONSTRAINT "ProductInventoryTransactions_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventoryTransactions" ADD CONSTRAINT "ProductInventoryTransactions_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "ProductInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelations" ADD CONSTRAINT "ProductRelations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelations" ADD CONSTRAINT "ProductRelations_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashDealProducts" ADD CONSTRAINT "FlashDealProducts_flash_deal_id_fkey" FOREIGN KEY ("flash_deal_id") REFERENCES "FlashDeals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashDealProducts" ADD CONSTRAINT "FlashDealProducts_product_variants_id_fkey" FOREIGN KEY ("product_variants_id") REFERENCES "ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSettingOptions" ADD CONSTRAINT "SystemSettingOptions_system_setting_id_fkey" FOREIGN KEY ("system_setting_id") REFERENCES "SystemSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
