import { Prisma, type PrismaClient } from "@prisma/client";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function deleteImageBlobIfUnused(prisma: PrismaLike, blobId?: number | null): Promise<void> {
  if (!blobId) {
    return;
  }

  const [avatarReferences, pictureReferences] = await Promise.all([
    prisma.user.count({ where: { avatarBlobId: blobId } }),
    prisma.advertisementPicture.count({ where: { blobId } }),
  ]);

  if (avatarReferences > 0 || pictureReferences > 0) {
    return;
  }

  try {
    await prisma.imageBlob.delete({ where: { id: blobId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return;
    }

    throw error;
  }
}
