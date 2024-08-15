--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Debian 16.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admins" (
    id text NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    phone character varying NOT NULL,
    job character varying,
    gender smallint,
    address character varying,
    refresh_token character varying,
    role smallint NOT NULL,
    image_uri character varying,
    status smallint DEFAULT 10,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Admins" OWNER TO postgres;

--
-- Name: FlashDealProducts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FlashDealProducts" (
    flash_deal_id text NOT NULL,
    product_variants_id text NOT NULL,
    quantity_limit integer DEFAULT 0
);


ALTER TABLE public."FlashDealProducts" OWNER TO postgres;

--
-- Name: FlashDeals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FlashDeals" (
    id text NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    description character varying,
    status smallint DEFAULT 10,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."FlashDeals" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    image_uri character varying,
    short_description character varying,
    description text,
    technical_specifications jsonb,
    product_category_id text NOT NULL,
    product_brand_id text,
    status smallint DEFAULT 20,
    product_type smallint DEFAULT 10,
    price numeric(18,0) DEFAULT 0 NOT NULL,
    special_price numeric(18,0) DEFAULT 0,
    special_price_type smallint,
    meta_title character varying,
    meta_description character varying,
    total_rating double precision,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL,
    sku character varying NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductAttribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductAttribute" (
    id text NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description character varying,
    status smallint DEFAULT 20,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductAttribute" OWNER TO postgres;

--
-- Name: ProductAttributeValues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductAttributeValues" (
    id text NOT NULL,
    value character varying NOT NULL,
    product_attribute_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductAttributeValues" OWNER TO postgres;

--
-- Name: ProductBrand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductBrand" (
    id text NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    image_uri character varying,
    description character varying,
    status smallint DEFAULT 20,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductBrand" OWNER TO postgres;

--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    image_uri character varying,
    description character varying,
    parent_id text,
    status smallint DEFAULT 20,
    meta_title character varying,
    meta_description character varying,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductCategory" OWNER TO postgres;

--
-- Name: ProductCategoryAttributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCategoryAttributes" (
    product_category_id text NOT NULL,
    product_attribute_id text NOT NULL
);


ALTER TABLE public."ProductCategoryAttributes" OWNER TO postgres;

--
-- Name: ProductCategoryBrand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCategoryBrand" (
    product_brand_id text NOT NULL,
    product_category_id text NOT NULL
);


ALTER TABLE public."ProductCategoryBrand" OWNER TO postgres;

--
-- Name: ProductCollection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCollection" (
    id text NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    status smallint DEFAULT 20,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductCollection" OWNER TO postgres;

--
-- Name: ProductCollectionProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCollectionProduct" (
    product_id text NOT NULL,
    product_collection_id text NOT NULL
);


ALTER TABLE public."ProductCollectionProduct" OWNER TO postgres;

--
-- Name: ProductImages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImages" (
    id text NOT NULL,
    product_id text NOT NULL,
    image_uri character varying NOT NULL,
    index smallint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductImages" OWNER TO postgres;

--
-- Name: ProductInventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductInventory" (
    id text NOT NULL,
    product_variant_id text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."ProductInventory" OWNER TO postgres;

--
-- Name: ProductInventoryTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductInventoryTransactions" (
    id text NOT NULL,
    admin_id text,
    product_variant_id text NOT NULL,
    product_inventory_id text NOT NULL,
    transaction_type smallint NOT NULL,
    quantity integer NOT NULL,
    description text NOT NULL
);


ALTER TABLE public."ProductInventoryTransactions" OWNER TO postgres;

--
-- Name: ProductPrices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductPrices" (
    id text NOT NULL,
    product_variant_id text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    price numeric(18,0) DEFAULT 0 NOT NULL,
    special_price numeric(18,0) DEFAULT 0,
    special_price_type smallint,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductPrices" OWNER TO postgres;

--
-- Name: ProductRelations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductRelations" (
    id text NOT NULL,
    product_id text NOT NULL,
    related_product_id text NOT NULL,
    relation_type smallint NOT NULL
);


ALTER TABLE public."ProductRelations" OWNER TO postgres;

--
-- Name: ProductVariantAttributeValues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariantAttributeValues" (
    product_variant_id text NOT NULL,
    product_attribute_value_id text NOT NULL
);


ALTER TABLE public."ProductVariantAttributeValues" OWNER TO postgres;

--
-- Name: ProductVariants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariants" (
    id text NOT NULL,
    product_id text NOT NULL,
    label character varying,
    manage_inventory smallint DEFAULT 20,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ProductVariants" OWNER TO postgres;

--
-- Name: SystemSettingOptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSettingOptions" (
    id text NOT NULL,
    system_setting_id text NOT NULL,
    key character varying NOT NULL,
    "displayValue" character varying NOT NULL,
    sort_order integer
);


ALTER TABLE public."SystemSettingOptions" OWNER TO postgres;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSettings" (
    id text NOT NULL,
    label character varying NOT NULL,
    key character varying NOT NULL,
    value text,
    input_type smallint DEFAULT 10,
    system_type smallint,
    description character varying,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_flg boolean DEFAULT false NOT NULL
);


ALTER TABLE public."SystemSettings" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admins" (id, name, email, password, phone, job, gender, address, refresh_token, role, image_uri, status, created_at, updated_at, deleted_flg) FROM stdin;
a3vn6amq3hjyoq6c7b94wmtb	Administrator	longdang0412@gmail.com	$argon2id$v=19$m=65536,t=2,p=1$wEYuCRVHXJ8873Vkb4PNiDfoASqkIaKcG28oJhnIARc$HlSoTsmJIdHYScPoTWRsFmcx67FXdFED0nIO2fVesmI	0389747179	\N	\N	\N	$argon2id$v=19$m=65536,t=2,p=1$6r3l0f9BNR7oN9PiPnGfU11HiCjhux7s5HXnb1nY2O0$X3h/MKA/LJIyAdGFOXtyOsyaTZYK4oRIwh75mlx+tLw	10	\N	10	2024-08-15 03:53:45.156	2024-08-15 03:53:49.661	f
\.


--
-- Data for Name: FlashDealProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FlashDealProducts" (flash_deal_id, product_variants_id, quantity_limit) FROM stdin;
\.


--
-- Data for Name: FlashDeals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FlashDeals" (id, title, slug, description, status, start_time, end_time, created_at, updated_at, deleted_flg) FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, image_uri, short_description, description, technical_specifications, product_category_id, product_brand_id, status, product_type, price, special_price, special_price_type, meta_title, meta_description, total_rating, created_at, updated_at, deleted_flg, sku) FROM stdin;
lm80h2z33k0kexrq8ytjaqng	Set dao cạo râu và 36 lưỡi dao kép chính hiệu Luxury, tặng kèm tuýp kem cạo râu, giúp bạn cạo không đau, sảng khoái	set-dao-cao-rau-va-36-luoi-dao-kep-chinh-hieu-luxury-tang-kem-tuyp-kem-cao-rau-giup-ban-cao-khong-dau-sang-khoai	\N	Set dao cạo râu và 36 lưỡi dao kép chính hiệu Luxury, tặng kèm tuýp kem cạo râu, giúp bạn cạo không đau, sảng khoái\n\n	<p><span style="color: rgba(0, 0, 0, 0.8);">Lưỡi sắc bén, không gây chảy máu, dễ dàng sử dụng và tháo lắp</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Phần tay cầm thiết kế linh hoạt giúp cạo râu được dễ dàng </span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Cạo sạch nhanh chóng, không gây rát.</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Hiệu quả cao: 1 lưỡi có thể dùng từ 25 -35 lần</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Lưỡi cạo được thiết kế đặc biệt ôm sát, điều chỉnh theo từng góc độ khuôn mặt.</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Với thiết kế lưỡi thép chắc chắn, sắc lẹm giúp sử dụng được nhiều lần.</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">Lưỡi dao cạo mỏng giúp dao lướt nhẹ và êm</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">– Tích hợp dải bôi trơn giúp giảm ma sát trong quá trình cạo</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">– Kiểu dáng đẹp hiện đại, trọng lượng nhẹ tuyệt vời và cân bằng để dễ dàng chuyển đổi giữa mặt trước và mặt cạo trở lại</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">* Ưu điểm nổi bật :</span></p><p><span style="color: rgba(0, 0, 0, 0.8);">- Dao cạo râu có đầu lưỡi dao di động, tự động điều chỉnh theo đường cong khuôn mặt, giúp việc cạo râu an toàn hơn.</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">- Lưỡi dao cạo râu với đầu thon gọn, có thể cạo sát ở tất cả các vùng trên khuôn mặt.</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">- Cạo sạch triệt để râu, lưỡi cạo rất sắc bén, cạo ngọt ,mịn.</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">SHOP CÓ NHIỀU COMBO ĐỂ KHÁCH HÀNG LỰA CHỌN PHÙ HỢP VỚI MỤC ĐÍCH SỬ DỤNG</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">+COMBO 1 : 1 DAO CẠO + 36 LƯỠI DAO + TẶNG 1 TUÝP KEM CẠO RÂU</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">+COMBO 2 : 1 DAO CẠO + 12 LƯỠI DAO + TẶNG 1 TUÝP KEM CẠO RÂU</span></p><p><br></p><p><span style="color: rgba(0, 0, 0, 0.8);">+COMBO 3 :  1 DAO CẠO + 6 LƯỠI DAO + TẶNG 1 TUÝP KEM CẠO RÂU</span></p>	[{"title": "Số lượng hàng khuyến mãi", "content": "277"}, {"title": "Số sản phẩm còn lại", "content": "132588"}, {"title": "Vùng cơ thể", "content": "Mặt"}, {"title": "Trọng lượng", "content": "150g"}]	w1v5mjzv5156feq9re28seu0	\N	10	10	58000	57	20	Set dao cạo râu và 36 lưỡi dao kép chính hiệu Luxury, tặng kèm tuýp kem cạo râu, giúp bạn cạo không đau, sảng khoái	Set dao cạo râu và 36 lưỡi dao kép chính hiệu Luxury, tặng kèm tuýp kem cạo râu, giúp bạn cạo không đau, sảng khoái	\N	2024-08-15 03:51:06.496	2024-08-15 03:51:06.496	f	shopmaihuong90
\.


--
-- Data for Name: ProductAttribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductAttribute" (id, name, slug, description, status, created_at, updated_at, deleted_flg) FROM stdin;
dqzzfdzxcep6yzct7otwqx24	Màu sắc	mau-sac	\N	10	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
nxkfx2hunf157rhar4xlv4t5	Kích thước	kich-thuoc	\N	10	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
\.


--
-- Data for Name: ProductAttributeValues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductAttributeValues" (id, value, product_attribute_id, created_at, updated_at, deleted_flg) FROM stdin;
clzuql20i0003q7f1nyw4mybf	Đỏ	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuql20i0004q7f1dl273ntp	Hồng	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuql20i0005q7f1ivyyx33f	Trắng	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuql20i0006q7f1cakuztjm	Xanh	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuql20i0007q7f1xlb3zhoy	Đen	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuql20i0008q7f14k15x35f	Xám	dqzzfdzxcep6yzct7otwqx24	2024-08-15 03:44:25.458	2024-08-15 03:44:25.458	f
clzuqlu57000aq7f1axe3aev5	S	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
clzuqlu57000bq7f11u0batz3	M	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
clzuqlu57000cq7f1z869au40	L	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
clzuqlu57000dq7f1sukm8d7i	XL	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
clzuqlu57000eq7f1b2ljrcf4	2XL	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
clzuqlu57000fq7f1mua16aya	3XL	nxkfx2hunf157rhar4xlv4t5	2024-08-15 03:45:01.914	2024-08-15 03:45:01.914	f
\.


--
-- Data for Name: ProductBrand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductBrand" (id, name, slug, image_uri, description, status, created_at, updated_at, deleted_flg) FROM stdin;
d39nb4ya1evete2izu127a26	Ovacado	ovacado	\N	Ovacado	10	2024-08-15 03:32:40.568	2024-08-15 03:32:40.568	f
mc30jklh9i6a0s4w2f991091	Padas	padas	\N	Padas	10	2024-08-15 03:33:09.307	2024-08-15 03:33:09.307	f
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCategory" (id, name, slug, image_uri, description, parent_id, status, meta_title, meta_description, created_at, updated_at, deleted_flg) FROM stdin;
v7ye87qg2u29ar9kxfrkapqj	Thời trang nam	thoi-trang-nam	\N	Mô tả\n	\N	10	Meta Title\n	Meta Description	2024-08-14 03:00:30.991	2024-08-14 03:00:30.991	f
e6jx5vajm5e3a4p9ti5crom9	Áo Khoác	ao-khoac	\N	Áo Khoác	v7ye87qg2u29ar9kxfrkapqj	10	Áo Khoác	Áo Khoác	2024-08-14 03:00:57.84	2024-08-14 03:00:57.84	f
h1mjexe6vidxofbyil3fo9gb	Áo Vest và Blazer	ao-vest-va-blazer	\N	Áo Vest và Blazer	v7ye87qg2u29ar9kxfrkapqj	10	Áo Vest và Blazer	Áo Vest và Blazer	2024-08-14 03:01:28.156	2024-08-14 03:01:28.156	f
c1x0yigcc66rfksz1jzt08ke	Kính mắt nam	kinh-mat-nam	\N	Kính mắt nam	v7ye87qg2u29ar9kxfrkapqj	10	Kính mắt nam	Kính mắt nam	2024-08-14 03:01:48.558	2024-08-14 03:01:48.558	f
rd3pvunpjspz6nhjc2ycd17z	Thắt lưng nam	that-lung-nam	\N	Thắt lưng nam	v7ye87qg2u29ar9kxfrkapqj	10	Thắt lưng nam	Thắt lưng nam	2024-08-14 03:01:57.213	2024-08-14 03:01:57.213	f
uvrllf12cjy65q0uimvsfg7c	Quần Jeans	quan-jeans	\N	Quần Jeans	v7ye87qg2u29ar9kxfrkapqj	20	Quần Jeans	Quần Jeans	2024-08-14 03:02:12.519	2024-08-14 03:02:12.519	f
mq3c5xtmc8f1eygwua5380ig	Áo ba lỗ	ao-ba-lo	\N	Áo ba lỗ	v7ye87qg2u29ar9kxfrkapqj	20	Áo ba lỗ	Áo ba lỗ	2024-08-14 03:02:23.167	2024-08-14 03:02:23.167	f
msfk98oc9587ds3tasgle8rw	Trang sức nam	trang-suc-nam	\N	Trang sức nam	v7ye87qg2u29ar9kxfrkapqj	10	Trang sức nam	Trang sức nam	2024-08-14 03:02:33.495	2024-08-14 03:02:33.495	f
mwn1uch0fs6vwu4a49u84aoo	Thời trang nữ	thoi-trang-nu	\N	Thời trang nữ	\N	10	Thời trang nữ	Thời trang nữ	2024-08-14 03:02:53.433	2024-08-14 03:02:53.433	f
mt4tgygfjpe02kjdhli0gsd4	Chân váy	chan-vay	\N	Chân váy	mwn1uch0fs6vwu4a49u84aoo	10	Chân váy	Chân váy	2024-08-14 03:03:06.438	2024-08-14 03:03:06.438	f
vwn8xqsb6rxidqjopgf2dxiu	Váy cưới	vay-cuoi	\N	Váy cưới	mwn1uch0fs6vwu4a49u84aoo	10	Váy cưới	Váy cưới	2024-08-14 03:03:14.46	2024-08-14 03:03:14.46	f
f3gawnr081mp8eongtqes5nz	Đầm / Váy	dam-vay	\N	Đầm / Váy	mwn1uch0fs6vwu4a49u84aoo	10	Đầm / Váy	Đầm / Váy	2024-08-14 03:03:41.49	2024-08-14 03:03:41.49	f
r8470ffi2rubpd2hpledkxox	Đồ ngủ	do-ngu	\N	Đồ ngủ	mwn1uch0fs6vwu4a49u84aoo	20	Đồ ngủ	Đồ ngủ	2024-08-14 03:03:47.941	2024-08-14 03:03:47.941	f
znvzavauzaglacxtip1zimbk	Đồ bầu	do-bau	\N	Đồ bầu	mwn1uch0fs6vwu4a49u84aoo	10	Đồ bầu	Đồ bầu	2024-08-14 03:04:06.271	2024-08-14 03:04:06.271	f
fh6gc4tdushiyz0vi8xj65xw	Đồ lót	do-lot	\N	Đồ lót	mwn1uch0fs6vwu4a49u84aoo	20	Đồ lót	Đồ lót	2024-08-14 03:04:41.736	2024-08-14 03:04:41.736	f
s2p72r8sfyfojh07je6lh2db	Sức khỏe	suc-khoe	\N	Sức khỏe	\N	10	Sức khỏe	Sức khỏe	2024-08-14 03:05:26.232	2024-08-14 03:05:26.232	f
qmua9pp1rg1ocm40yi1s87oa	Vật tư y tế	vat-tu-y-te	\N	Vật tư y tế	s2p72r8sfyfojh07je6lh2db	10	Vật tư y tế	Vật tư y tế	2024-08-14 03:05:43.353	2024-08-14 03:05:43.353	f
kgqdr7ompmosys7y84sdlklv	Thực phẩm chức năng	thuc-pham-chuc-nang	\N	Thực phẩm chức năng	s2p72r8sfyfojh07je6lh2db	10	Thực phẩm chức năng	Thực phẩm chức năng	2024-08-14 03:06:18.736	2024-08-14 03:06:18.736	f
w1v5mjzv5156feq9re28seu0	Hỗ trợ làm đẹp	ho-tro-lam-dep	\N	Hỗ trợ làm đẹp	s2p72r8sfyfojh07je6lh2db	10	Hỗ trợ làm đẹp	Hỗ trợ làm đẹp	2024-08-14 03:06:33.399	2024-08-14 03:06:33.399	f
q5le22347pgzu68ky95nd6in	Hỗ trợ tình dục	ho-tro-tinh-duc	\N	Hỗ trợ tình dục	s2p72r8sfyfojh07je6lh2db	20	Hỗ trợ tình dục	Hỗ trợ tình dục	2024-08-14 03:06:43.088	2024-08-14 03:06:43.088	f
p8x8yb739nbzh9ldg3eho89z	Dụng cụ massage và trị liệu	dung-cu-massage-va-tri-lieu	\N	Dụng cụ massage và trị liệu	s2p72r8sfyfojh07je6lh2db	10	Dụng cụ massage và trị liệu	Dụng cụ massage và trị liệu	2024-08-14 03:07:02.351	2024-08-14 03:07:02.351	f
j79f3draz87vqwh3ayxs5klg	Phụ kiện & trang sức nữ	phu-kien-trang-suc-nu-20240814	\N	Phụ kiện & trang sức nữ	s2p72r8sfyfojh07je6lh2db	10	Phụ kiện & trang sức nữ	Phụ kiện & trang sức nữ	2024-08-14 03:07:20.955	2024-08-14 03:08:35.975	t
e6thh1j4qfmvj2kxilgr21lg	Phụ kiện & trang sức nữ	phu-kien-trang-suc-nu	\N	Phụ kiện & trang sức nữ	\N	10	Phụ kiện & trang sức nữ	Phụ kiện & trang sức nữ	2024-08-14 03:08:54.483	2024-08-14 03:08:54.483	f
nfz76m97od9ygwfk36dw7efi	Khăn choàng	khan-choang	\N	Khăn choàng	e6thh1j4qfmvj2kxilgr21lg	10	Khăn choàng	Khăn choàng	2024-08-14 03:07:53.639	2024-08-14 03:08:59.877	f
zro5jzkaqdtcbe9ahrrmtfk6	Nhẫn	nhan	\N	Nhẫn	e6thh1j4qfmvj2kxilgr21lg	10	Nhẫn	Nhẫn	2024-08-14 03:09:19.993	2024-08-14 03:09:19.993	f
dxakccf7mlpnbauvco4b6d7z	Vòng tay / Lắc tay	vong-tay-lac-tay	\N	Vòng tay / Lắc tay	e6thh1j4qfmvj2kxilgr21lg	10	Vòng tay / Lắc tay	Vòng tay / Lắc tay	2024-08-14 03:09:32.335	2024-08-14 03:09:32.335	f
qul1laijh69dk4gwarnt7xve	Dây chuyền	day-chuyen	\N	Dây chuyền	e6thh1j4qfmvj2kxilgr21lg	10	Dây chuyền	Dây chuyền	2024-08-14 03:09:53.129	2024-08-14 03:09:53.129	f
ji3inx1amw4z89sh2hw62m7q	Kính mắt	kinh-mat	\N	Kính mắt	e6thh1j4qfmvj2kxilgr21lg	10	Kính mắt	Kính mắt	2024-08-14 03:10:00.453	2024-08-14 03:10:00.453	f
h2p30o1shdhvospm2q08tgoh	Lắc chân	lac-chan	\N	Lắc chân	e6thh1j4qfmvj2kxilgr21lg	20	Lắc chân	Lắc chân	2024-08-14 03:10:10.271	2024-08-14 03:10:10.271	f
mjoi2wqv22oyhbfdenm26pv3	Máy Tính & Laptop	may-tinh-laptop	\N	Máy Tính & Laptop	\N	10	Máy Tính & Laptop	Máy Tính & Laptop	2024-08-14 03:10:29.759	2024-08-14 03:10:29.759	f
r2muh8n0zedj0wks24hs8fyo	Máy Tính Bàn	may-tinh-ban	\N	Máy Tính Bàn	mjoi2wqv22oyhbfdenm26pv3	10	Máy Tính Bàn	Máy Tính Bàn	2024-08-14 03:13:56.806	2024-08-14 03:13:56.806	f
j47y1ni0t7y9jmlgiwqd4978	Thiết Bị Mạng	thiet-bi-mang	\N	Thiết Bị Mạng	mjoi2wqv22oyhbfdenm26pv3	10	Thiết Bị Mạng	Thiết Bị Mạng	2024-08-14 03:14:08.003	2024-08-14 03:14:08.003	f
jwtts83g5itmdf6qkuvm5ogk	Màn hình	man-hinh	\N	Màn hình	mjoi2wqv22oyhbfdenm26pv3	10	Màn hình	Màn hình	2024-08-14 03:14:31.435	2024-08-14 03:14:31.435	f
ks6oc9shcsbbwwbbixxgv99n	Linh kiện máy tính	linh-kien-may-tinh	\N	Linh kiện máy tính	mjoi2wqv22oyhbfdenm26pv3	10	Linh kiện máy tính	Linh kiện máy tính	2024-08-14 03:14:49.988	2024-08-14 03:14:49.988	f
wr555adojbctpsxlixd5vjdb	Phụ kiện máy tính	phu-kien-may-tinh	\N	Phụ kiện máy tính	mjoi2wqv22oyhbfdenm26pv3	20	Phụ kiện máy tính	Phụ kiện máy tính	2024-08-14 03:15:11.796	2024-08-14 03:15:11.796	f
mh0vmmvqq9i53xl6c3vnlz8a	Laptop	laptop	\N	Laptop	mjoi2wqv22oyhbfdenm26pv3	10	Laptop	Laptop	2024-08-14 03:15:23.427	2024-08-14 03:15:23.427	f
vph1ubu0s1ftocjkp8eg9xwv	Điện Thoại & Phụ Kiện	dien-thoai-phu-kien	\N	Điện Thoại & Phụ Kiện	\N	10	Điện Thoại & Phụ Kiện	Điện Thoại & Phụ Kiện	2024-08-14 03:16:09.883	2024-08-14 03:16:09.883	f
czh4wbhz1b2vj91e0heixftv	Điện thoại	dien-thoai	\N	Điện thoại	vph1ubu0s1ftocjkp8eg9xwv	10	Điện thoại	Điện thoại	2024-08-14 03:16:29.484	2024-08-14 03:16:29.484	f
yu7lknfixzmp3o14236l2jbs	Pin dự phòng	pin-du-phong	\N	Pin dự phòng	vph1ubu0s1ftocjkp8eg9xwv	10	Pin dự phòng	Pin dự phòng	2024-08-14 03:16:48.623	2024-08-14 03:16:48.623	f
richfxbfdwffnbhfyqna1n0r	Thẻ nhớ	the-nho	\N	Thẻ nhớ	vph1ubu0s1ftocjkp8eg9xwv	10	Thẻ nhớ	Thẻ nhớ	2024-08-14 03:16:56.227	2024-08-14 03:16:56.227	f
jpdoczd6e6hps8egcmgldbil	Đế giữ điện thoại	de-giu-dien-thoai	\N	Đế giữ điện thoại	vph1ubu0s1ftocjkp8eg9xwv	10	Đế giữ điện thoại	Đế giữ điện thoại	2024-08-14 03:17:12.18	2024-08-14 03:17:12.18	f
\.


--
-- Data for Name: ProductCategoryAttributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCategoryAttributes" (product_category_id, product_attribute_id) FROM stdin;
vph1ubu0s1ftocjkp8eg9xwv	dqzzfdzxcep6yzct7otwqx24
czh4wbhz1b2vj91e0heixftv	dqzzfdzxcep6yzct7otwqx24
mjoi2wqv22oyhbfdenm26pv3	dqzzfdzxcep6yzct7otwqx24
r2muh8n0zedj0wks24hs8fyo	dqzzfdzxcep6yzct7otwqx24
mq3c5xtmc8f1eygwua5380ig	dqzzfdzxcep6yzct7otwqx24
uvrllf12cjy65q0uimvsfg7c	dqzzfdzxcep6yzct7otwqx24
msfk98oc9587ds3tasgle8rw	dqzzfdzxcep6yzct7otwqx24
rd3pvunpjspz6nhjc2ycd17z	dqzzfdzxcep6yzct7otwqx24
c1x0yigcc66rfksz1jzt08ke	dqzzfdzxcep6yzct7otwqx24
h1mjexe6vidxofbyil3fo9gb	dqzzfdzxcep6yzct7otwqx24
e6jx5vajm5e3a4p9ti5crom9	dqzzfdzxcep6yzct7otwqx24
v7ye87qg2u29ar9kxfrkapqj	dqzzfdzxcep6yzct7otwqx24
fh6gc4tdushiyz0vi8xj65xw	dqzzfdzxcep6yzct7otwqx24
znvzavauzaglacxtip1zimbk	dqzzfdzxcep6yzct7otwqx24
r8470ffi2rubpd2hpledkxox	dqzzfdzxcep6yzct7otwqx24
f3gawnr081mp8eongtqes5nz	dqzzfdzxcep6yzct7otwqx24
vwn8xqsb6rxidqjopgf2dxiu	dqzzfdzxcep6yzct7otwqx24
mt4tgygfjpe02kjdhli0gsd4	dqzzfdzxcep6yzct7otwqx24
mwn1uch0fs6vwu4a49u84aoo	dqzzfdzxcep6yzct7otwqx24
msfk98oc9587ds3tasgle8rw	nxkfx2hunf157rhar4xlv4t5
mq3c5xtmc8f1eygwua5380ig	nxkfx2hunf157rhar4xlv4t5
uvrllf12cjy65q0uimvsfg7c	nxkfx2hunf157rhar4xlv4t5
rd3pvunpjspz6nhjc2ycd17z	nxkfx2hunf157rhar4xlv4t5
c1x0yigcc66rfksz1jzt08ke	nxkfx2hunf157rhar4xlv4t5
h1mjexe6vidxofbyil3fo9gb	nxkfx2hunf157rhar4xlv4t5
e6jx5vajm5e3a4p9ti5crom9	nxkfx2hunf157rhar4xlv4t5
v7ye87qg2u29ar9kxfrkapqj	nxkfx2hunf157rhar4xlv4t5
fh6gc4tdushiyz0vi8xj65xw	nxkfx2hunf157rhar4xlv4t5
znvzavauzaglacxtip1zimbk	nxkfx2hunf157rhar4xlv4t5
r8470ffi2rubpd2hpledkxox	nxkfx2hunf157rhar4xlv4t5
f3gawnr081mp8eongtqes5nz	nxkfx2hunf157rhar4xlv4t5
vwn8xqsb6rxidqjopgf2dxiu	nxkfx2hunf157rhar4xlv4t5
mt4tgygfjpe02kjdhli0gsd4	nxkfx2hunf157rhar4xlv4t5
mwn1uch0fs6vwu4a49u84aoo	nxkfx2hunf157rhar4xlv4t5
\.


--
-- Data for Name: ProductCategoryBrand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCategoryBrand" (product_brand_id, product_category_id) FROM stdin;
d39nb4ya1evete2izu127a26	v7ye87qg2u29ar9kxfrkapqj
d39nb4ya1evete2izu127a26	e6jx5vajm5e3a4p9ti5crom9
d39nb4ya1evete2izu127a26	h1mjexe6vidxofbyil3fo9gb
d39nb4ya1evete2izu127a26	c1x0yigcc66rfksz1jzt08ke
d39nb4ya1evete2izu127a26	rd3pvunpjspz6nhjc2ycd17z
d39nb4ya1evete2izu127a26	uvrllf12cjy65q0uimvsfg7c
d39nb4ya1evete2izu127a26	mq3c5xtmc8f1eygwua5380ig
d39nb4ya1evete2izu127a26	msfk98oc9587ds3tasgle8rw
d39nb4ya1evete2izu127a26	fh6gc4tdushiyz0vi8xj65xw
d39nb4ya1evete2izu127a26	znvzavauzaglacxtip1zimbk
d39nb4ya1evete2izu127a26	r8470ffi2rubpd2hpledkxox
d39nb4ya1evete2izu127a26	f3gawnr081mp8eongtqes5nz
d39nb4ya1evete2izu127a26	mt4tgygfjpe02kjdhli0gsd4
d39nb4ya1evete2izu127a26	mwn1uch0fs6vwu4a49u84aoo
d39nb4ya1evete2izu127a26	vwn8xqsb6rxidqjopgf2dxiu
mc30jklh9i6a0s4w2f991091	msfk98oc9587ds3tasgle8rw
mc30jklh9i6a0s4w2f991091	mq3c5xtmc8f1eygwua5380ig
mc30jklh9i6a0s4w2f991091	uvrllf12cjy65q0uimvsfg7c
mc30jklh9i6a0s4w2f991091	rd3pvunpjspz6nhjc2ycd17z
mc30jklh9i6a0s4w2f991091	c1x0yigcc66rfksz1jzt08ke
mc30jklh9i6a0s4w2f991091	h1mjexe6vidxofbyil3fo9gb
mc30jklh9i6a0s4w2f991091	e6jx5vajm5e3a4p9ti5crom9
mc30jklh9i6a0s4w2f991091	v7ye87qg2u29ar9kxfrkapqj
mc30jklh9i6a0s4w2f991091	fh6gc4tdushiyz0vi8xj65xw
mc30jklh9i6a0s4w2f991091	znvzavauzaglacxtip1zimbk
mc30jklh9i6a0s4w2f991091	r8470ffi2rubpd2hpledkxox
mc30jklh9i6a0s4w2f991091	f3gawnr081mp8eongtqes5nz
mc30jklh9i6a0s4w2f991091	vwn8xqsb6rxidqjopgf2dxiu
mc30jklh9i6a0s4w2f991091	mt4tgygfjpe02kjdhli0gsd4
mc30jklh9i6a0s4w2f991091	mwn1uch0fs6vwu4a49u84aoo
\.


--
-- Data for Name: ProductCollection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCollection" (id, title, slug, status, created_at, updated_at, deleted_flg) FROM stdin;
\.


--
-- Data for Name: ProductCollectionProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCollectionProduct" (product_id, product_collection_id) FROM stdin;
\.


--
-- Data for Name: ProductImages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImages" (id, product_id, image_uri, index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ProductInventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductInventory" (id, product_variant_id, quantity) FROM stdin;
clzuqtngm0003addmhlnc3y4n	clzuqtngm0001addmchrvv4pe	1000
\.


--
-- Data for Name: ProductInventoryTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductInventoryTransactions" (id, admin_id, product_variant_id, product_inventory_id, transaction_type, quantity, description) FROM stdin;
\.


--
-- Data for Name: ProductPrices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductPrices" (id, product_variant_id, is_default, price, special_price, special_price_type, start_date, end_date, created_at, updated_at) FROM stdin;
clzuqtngm0002addmkebin33g	clzuqtngm0001addmchrvv4pe	t	58000	57	20	2024-08-15 03:51:06.496	\N	2024-08-15 03:51:06.496	2024-08-15 03:51:06.496
\.


--
-- Data for Name: ProductRelations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductRelations" (id, product_id, related_product_id, relation_type) FROM stdin;
\.


--
-- Data for Name: ProductVariantAttributeValues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariantAttributeValues" (product_variant_id, product_attribute_value_id) FROM stdin;
\.


--
-- Data for Name: ProductVariants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariants" (id, product_id, label, manage_inventory, created_at, updated_at, deleted_flg) FROM stdin;
clzuqtngm0001addmchrvv4pe	lm80h2z33k0kexrq8ytjaqng	\N	10	2024-08-15 03:51:06.496	2024-08-15 03:51:06.496	f
\.


--
-- Data for Name: SystemSettingOptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettingOptions" (id, system_setting_id, key, "displayValue", sort_order) FROM stdin;
clzt9do4m0001eua2frevar3w	clzt9do4m0000eua2pj35e6eq	blue	Blue	\N
clzt9do4m0002eua2vnsrdubj	clzt9do4m0000eua2pj35e6eq	red	Red	\N
clzt9do4m0003eua2cmdmapwp	clzt9do4m0000eua2pj35e6eq	sky	Sky	\N
clzt9do4m0004eua2437t6xkm	clzt9do4m0000eua2pj35e6eq	cyan	Cyan	\N
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettings" (id, label, key, value, input_type, system_type, description, created_at, updated_at, deleted_flg) FROM stdin;
clzt9do4m0000eua2pj35e6eq	Màu chủ đạo Website	system_theme_colour	blue	30	\N	Màu chủ đạo Website	2024-08-14 02:55:01.223	2024-08-14 02:56:59.267	f
d5h9vxv53o2mv4uckz96tjkn	BUNNY CDN Storage Name	secret_key_bunnycdn_storage_name	images-data	10	\N	\N	2024-08-15 03:53:45.16	2024-08-15 03:53:45.16	f
loq64l488l7ezb5prtxdyzgl	BUNNY CDN Storage Zone	secret_key_bunnycdn_storage_zone	sg	10	\N	\N	2024-08-15 03:53:45.16	2024-08-15 03:53:45.16	f
zdcj9bix8x3zm023v29gp2il	BUNNY CDN Access Key	secret_key_bunnycdn_access_key	be632842-d116-4d13-be84f8663711-a241-49c1	10	\N	\N	2024-08-15 03:53:45.16	2024-08-15 03:54:11.081	f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fe217975-db6b-48e0-865d-006968c1f93b	fa1e0f15f4cd536e94b7a2adcc66b161b2d649bc9dc3281b3c915c96d769bf44	2024-08-14 02:45:29.460055+00	20240722034838_init	\N	\N	2024-08-14 02:45:29.188134+00	1
\.


--
-- Name: Admins Admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admins"
    ADD CONSTRAINT "Admins_pkey" PRIMARY KEY (id);


--
-- Name: FlashDeals FlashDeals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashDeals"
    ADD CONSTRAINT "FlashDeals_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttributeValues ProductAttributeValues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAttributeValues"
    ADD CONSTRAINT "ProductAttributeValues_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttribute ProductAttribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY (id);


--
-- Name: ProductBrand ProductBrand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductBrand"
    ADD CONSTRAINT "ProductBrand_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);


--
-- Name: ProductCollection ProductCollection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCollection"
    ADD CONSTRAINT "ProductCollection_pkey" PRIMARY KEY (id);


--
-- Name: ProductImages ProductImages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImages"
    ADD CONSTRAINT "ProductImages_pkey" PRIMARY KEY (id);


--
-- Name: ProductInventoryTransactions ProductInventoryTransactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventoryTransactions"
    ADD CONSTRAINT "ProductInventoryTransactions_pkey" PRIMARY KEY (id);


--
-- Name: ProductInventory ProductInventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventory"
    ADD CONSTRAINT "ProductInventory_pkey" PRIMARY KEY (id);


--
-- Name: ProductPrices ProductPrices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPrices"
    ADD CONSTRAINT "ProductPrices_pkey" PRIMARY KEY (id);


--
-- Name: ProductRelations ProductRelations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelations"
    ADD CONSTRAINT "ProductRelations_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariants ProductVariants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettingOptions SystemSettingOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettingOptions"
    ADD CONSTRAINT "SystemSettingOptions_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Admins_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admins_email_key" ON public."Admins" USING btree (email);


--
-- Name: Admins_status_role_gender_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Admins_status_role_gender_idx" ON public."Admins" USING btree (status, role, gender);


--
-- Name: FlashDealProducts_flash_deal_id_product_variants_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FlashDealProducts_flash_deal_id_product_variants_id_key" ON public."FlashDealProducts" USING btree (flash_deal_id, product_variants_id);


--
-- Name: FlashDeals_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FlashDeals_slug_key" ON public."FlashDeals" USING btree (slug);


--
-- Name: ProductAttribute_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductAttribute_slug_key" ON public."ProductAttribute" USING btree (slug);


--
-- Name: ProductAttribute_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductAttribute_status_idx" ON public."ProductAttribute" USING btree (status);


--
-- Name: ProductBrand_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductBrand_slug_key" ON public."ProductBrand" USING btree (slug);


--
-- Name: ProductBrand_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductBrand_status_idx" ON public."ProductBrand" USING btree (status);


--
-- Name: ProductCategoryAttributes_product_category_id_product_attri_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCategoryAttributes_product_category_id_product_attri_key" ON public."ProductCategoryAttributes" USING btree (product_category_id, product_attribute_id);


--
-- Name: ProductCategoryBrand_product_brand_id_product_category_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCategoryBrand_product_brand_id_product_category_id_key" ON public."ProductCategoryBrand" USING btree (product_brand_id, product_category_id);


--
-- Name: ProductCategory_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON public."ProductCategory" USING btree (slug);


--
-- Name: ProductCategory_status_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductCategory_status_parent_id_idx" ON public."ProductCategory" USING btree (status, parent_id);


--
-- Name: ProductCollectionProduct_product_id_product_collection_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCollectionProduct_product_id_product_collection_id_key" ON public."ProductCollectionProduct" USING btree (product_id, product_collection_id);


--
-- Name: ProductCollection_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductCollection_slug_key" ON public."ProductCollection" USING btree (slug);


--
-- Name: ProductCollection_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductCollection_status_idx" ON public."ProductCollection" USING btree (status);


--
-- Name: ProductInventory_product_variant_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductInventory_product_variant_id_key" ON public."ProductInventory" USING btree (product_variant_id);


--
-- Name: ProductVariantAttributeValues_product_variant_id_product_at_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariantAttributeValues_product_variant_id_product_at_key" ON public."ProductVariantAttributeValues" USING btree (product_variant_id, product_attribute_value_id);


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: SystemSettingOptions_system_setting_id_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SystemSettingOptions_system_setting_id_key_key" ON public."SystemSettingOptions" USING btree (system_setting_id, key);


--
-- Name: SystemSettings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SystemSettings_key_key" ON public."SystemSettings" USING btree (key);


--
-- Name: FlashDealProducts FlashDealProducts_flash_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashDealProducts"
    ADD CONSTRAINT "FlashDealProducts_flash_deal_id_fkey" FOREIGN KEY (flash_deal_id) REFERENCES public."FlashDeals"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlashDealProducts FlashDealProducts_product_variants_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlashDealProducts"
    ADD CONSTRAINT "FlashDealProducts_product_variants_id_fkey" FOREIGN KEY (product_variants_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAttributeValues ProductAttributeValues_product_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAttributeValues"
    ADD CONSTRAINT "ProductAttributeValues_product_attribute_id_fkey" FOREIGN KEY (product_attribute_id) REFERENCES public."ProductAttribute"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategoryAttributes ProductCategoryAttributes_product_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategoryAttributes"
    ADD CONSTRAINT "ProductCategoryAttributes_product_attribute_id_fkey" FOREIGN KEY (product_attribute_id) REFERENCES public."ProductAttribute"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategoryAttributes ProductCategoryAttributes_product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategoryAttributes"
    ADD CONSTRAINT "ProductCategoryAttributes_product_category_id_fkey" FOREIGN KEY (product_category_id) REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategoryBrand ProductCategoryBrand_product_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategoryBrand"
    ADD CONSTRAINT "ProductCategoryBrand_product_brand_id_fkey" FOREIGN KEY (product_brand_id) REFERENCES public."ProductBrand"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategoryBrand ProductCategoryBrand_product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategoryBrand"
    ADD CONSTRAINT "ProductCategoryBrand_product_category_id_fkey" FOREIGN KEY (product_category_id) REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategory ProductCategory_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCollectionProduct ProductCollectionProduct_product_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCollectionProduct"
    ADD CONSTRAINT "ProductCollectionProduct_product_collection_id_fkey" FOREIGN KEY (product_collection_id) REFERENCES public."ProductCollection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCollectionProduct ProductCollectionProduct_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCollectionProduct"
    ADD CONSTRAINT "ProductCollectionProduct_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImages ProductImages_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImages"
    ADD CONSTRAINT "ProductImages_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductInventoryTransactions ProductInventoryTransactions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventoryTransactions"
    ADD CONSTRAINT "ProductInventoryTransactions_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public."Admins"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductInventoryTransactions ProductInventoryTransactions_product_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventoryTransactions"
    ADD CONSTRAINT "ProductInventoryTransactions_product_inventory_id_fkey" FOREIGN KEY (product_inventory_id) REFERENCES public."ProductInventory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductInventoryTransactions ProductInventoryTransactions_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventoryTransactions"
    ADD CONSTRAINT "ProductInventoryTransactions_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductInventory ProductInventory_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductInventory"
    ADD CONSTRAINT "ProductInventory_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductPrices ProductPrices_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPrices"
    ADD CONSTRAINT "ProductPrices_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductRelations ProductRelations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelations"
    ADD CONSTRAINT "ProductRelations_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductRelations ProductRelations_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelations"
    ADD CONSTRAINT "ProductRelations_related_product_id_fkey" FOREIGN KEY (related_product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariantAttributeValues ProductVariantAttributeValues_product_attribute_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariantAttributeValues"
    ADD CONSTRAINT "ProductVariantAttributeValues_product_attribute_value_id_fkey" FOREIGN KEY (product_attribute_value_id) REFERENCES public."ProductAttributeValues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariantAttributeValues ProductVariantAttributeValues_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariantAttributeValues"
    ADD CONSTRAINT "ProductVariantAttributeValues_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariants ProductVariants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_product_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_product_brand_id_fkey" FOREIGN KEY (product_brand_id) REFERENCES public."ProductBrand"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_product_category_id_fkey" FOREIGN KEY (product_category_id) REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SystemSettingOptions SystemSettingOptions_system_setting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettingOptions"
    ADD CONSTRAINT "SystemSettingOptions_system_setting_id_fkey" FOREIGN KEY (system_setting_id) REFERENCES public."SystemSettings"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

