-- Create table for binary image storage.
CREATE TABLE "ImageBlob" (
  "id" SERIAL NOT NULL,
  "data" BYTEA NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileName" TEXT,
  "sizeBytes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ImageBlob_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User"
ADD COLUMN "avatarBlobId" INTEGER;

ALTER TABLE "AdvertisementPicture"
ADD COLUMN "blobId" INTEGER;

CREATE INDEX "User_avatarBlobId_idx" ON "User"("avatarBlobId");
CREATE INDEX "AdvertisementPicture_blobId_idx" ON "AdvertisementPicture"("blobId");

ALTER TABLE "User"
ADD CONSTRAINT "User_avatarBlobId_fkey"
FOREIGN KEY ("avatarBlobId") REFERENCES "ImageBlob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdvertisementPicture"
ADD CONSTRAINT "AdvertisementPicture_blobId_fkey"
FOREIGN KEY ("blobId") REFERENCES "ImageBlob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
DROP COLUMN "avatarStoragePath";

ALTER TABLE "AdvertisementPicture"
DROP COLUMN "storagePath";
