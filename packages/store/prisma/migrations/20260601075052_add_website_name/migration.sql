ALTER TABLE "Website" ADD COLUMN "name" TEXT;

UPDATE "Website" SET "name" = "url";

ALTER TABLE "Website" ALTER COLUMN "name" SET NOT NULL;