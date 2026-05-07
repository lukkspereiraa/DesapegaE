/*
  Warnings:

  - You are about to drop the column `postalCode` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,stateId]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `State` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('Admin', 'Advertiser', 'Guest');

-- DropForeignKey
ALTER TABLE "AdvertisementPicture" DROP CONSTRAINT "AdvertisementPicture_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "postalCode" TEXT NOT NULL DEFAULT '00000-000',
ADD COLUMN     "street" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Preserve existing city postal codes on linked addresses before dropping City.postalCode.
UPDATE "Address" AS "a"
SET "postalCode" = "c"."postalCode"
FROM "City" AS "c"
WHERE "a"."cityId" = "c"."id"
  AND "c"."postalCode" IS NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "City" DROP COLUMN "postalCode",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "readAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "roleId" INTEGER,
ALTER COLUMN "avatarUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "jti" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Advertisement_advertiserId_idx" ON "Advertisement"("advertiserId");

-- CreateIndex
CREATE INDEX "Advertisement_categoryId_idx" ON "Advertisement"("categoryId");

-- CreateIndex
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_stateId_key" ON "City"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- Seed fixed role kinds used by auth/authorization.
INSERT INTO "Role" ("name", "createdAt", "updatedAt")
VALUES
  ('Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Advertiser', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Guest', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Backfill legacy users from User.kind into Role relation.
UPDATE "User" AS "u"
SET "roleId" = "r"."id"
FROM "Role" AS "r"
WHERE "u"."roleId" IS NULL
  AND "r"."name" =
    CASE
      WHEN "u"."kind" = 'Admin'::"UserKind" THEN 'Admin'::"RoleName"
      ELSE 'Advertiser'::"RoleName"
    END;

-- Remove legacy enum-based role column after relation backfill.
ALTER TABLE "User" DROP COLUMN "kind";

-- DropEnum
DROP TYPE "UserKind";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPicture" ADD CONSTRAINT "AdvertisementPicture_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
