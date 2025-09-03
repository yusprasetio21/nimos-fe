/*
 Navicat Premium Data Transfer

 Source Server         : LAPTOP
 Source Server Type    : PostgreSQL
 Source Server Version : 140004 (140004)
 Source Host           : localhost:5432
 Source Catalog        : backapp
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 140004 (140004)
 File Encoding         : 65001

 Date: 02/09/2025 13:26:03
*/


-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS "public"."menus";
CREATE TABLE "public"."menus" (
  "id" int8 NOT NULL DEFAULT nextval('menus_id_seq'::regclass),
  "label" json NOT NULL,
  "icon" json,
  "url" varchar(125) COLLATE "pg_catalog"."default",
  "parent_id" int8,
  "order" int4 NOT NULL DEFAULT 0,
  "is_active" bool NOT NULL DEFAULT false,
  "created_at" timestamp(0),
  "updated_at" timestamp(0),
  "deleted_at" timestamp(0),
  "permission_id" int8,
  "type" varchar(125) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO "public"."menus" VALUES (1, '{"en":"Dashboard"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/dashboard-adm', NULL, 1, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 198, 'menu-item');
INSERT INTO "public"."menus" VALUES (2, '{"en":"Dashboard"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/dashboard-pic', NULL, 2, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 205, 'menu-item');
INSERT INTO "public"."menus" VALUES (3, '{"en":"Dashboard"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/dashboard-user', NULL, 3, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 212, 'menu-item');
INSERT INTO "public"."menus" VALUES (4, '{"en":"Metadata"}', '{"name":"general\/gen019","class":"","style":"","type":"duotune"}', '', NULL, 4, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 219, 'header');
INSERT INTO "public"."menus" VALUES (5, '{"en":"Station Management"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/my-stations', 4, 5, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 226, 'menu-item');
INSERT INTO "public"."menus" VALUES (6, '{"en":"Station Characteristic"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/station-edits', 4, 6, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 233, 'menu-item');
INSERT INTO "public"."menus" VALUES (7, '{"en":"Observation\/Measurement"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/observation', 4, 7, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 240, 'menu-item');
INSERT INTO "public"."menus" VALUES (8, '{"en":"Documents"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/documents', 4, 8, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 247, 'menu-item');
INSERT INTO "public"."menus" VALUES (9, '{"en":"Bibliographies"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/bibliographies', 4, 9, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 254, 'menu-item');
INSERT INTO "public"."menus" VALUES (10, '{"en":"Contacts"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/contacts', 4, 10, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 261, 'menu-item');
INSERT INTO "public"."menus" VALUES (11, '{"en":"Settings"}', '{"name":"general\/gen019","class":"","style":"","type":"duotune"}', '', NULL, 11, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 268, 'header');
INSERT INTO "public"."menus" VALUES (12, '{"en":"Portal Management"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/portals', 11, 12, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 275, 'menu-item');
INSERT INTO "public"."menus" VALUES (13, '{"en":"User Management"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/user-adms', 11, 13, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 282, 'menu-item');
INSERT INTO "public"."menus" VALUES (14, '{"en":"User Management"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/user-pics', 11, 14, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 289, 'menu-item');
INSERT INTO "public"."menus" VALUES (15, '{"en":"Station Assignment"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/station-assign-adms', 11, 15, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 296, 'menu-item');
INSERT INTO "public"."menus" VALUES (16, '{"en":"Station Assignment"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/station-assign-pics', 11, 16, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 303, 'menu-item');
INSERT INTO "public"."menus" VALUES (17, '{"en":"WIGOS ID"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/wigos-ids', 11, 17, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 310, 'menu-item');
INSERT INTO "public"."menus" VALUES (18, '{"en":"Organization"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/organizations', 11, 18, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 317, 'menu-item');
INSERT INTO "public"."menus" VALUES (19, '{"en":"Ingest Metadata"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/ingests', 11, 19, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 324, 'menu-item');
INSERT INTO "public"."menus" VALUES (20, '{"en":"Information"}', '{"name":"general\/gen019","class":"","style":"","type":"duotune"}', '', NULL, 20, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 331, 'header');
INSERT INTO "public"."menus" VALUES (21, '{"en":"News"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/news', 20, 21, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 338, 'menu-item');
INSERT INTO "public"."menus" VALUES (22, '{"en":"Auditrail"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/auditrails', 20, 22, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 345, 'menu-item');
INSERT INTO "public"."menus" VALUES (23, '{"en":"Other"}', '{"name":"general\/gen019","class":"","style":"","type":"duotune"}', '', NULL, 23, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 352, 'header');
INSERT INTO "public"."menus" VALUES (24, '{"en":"Back To Home"}', '{"name":"general\/gen022","class":"","style":"","type":"duotune"}', '/index', 23, 24, 't', '2023-02-08 22:23:30', '2023-02-08 22:23:30', NULL, 359, 'menu-item');

-- ----------------------------
-- Primary Key structure for table menus
-- ----------------------------
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table menus
-- ----------------------------
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_parent_id_foreign" FOREIGN KEY ("parent_id") REFERENCES "public"."menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_permission_id_foreign" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
