-- Add storage path metadata for locally uploaded images.
ALTER TABLE "User"
ADD COLUMN "avatarStoragePath" TEXT;

ALTER TABLE "AdvertisementPicture"
ADD COLUMN "storagePath" TEXT;
