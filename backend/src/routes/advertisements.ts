import { type Response, Router } from "express";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../prisma.js";

export const advertisementRouter = Router();

const createAdvertisementSchema = z.object({
  advertiserId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  conditions: z.string().min(1),
  categoryId: z.coerce.number().int().positive(),
  status: z.enum(["Open", "Closed", "Blocked"]).optional(),
  pictures: z.array(z.string().min(1)).optional(),
});

const updateAdvertisementSchema = createAdvertisementSchema.partial();

const isKnownPrismaError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

const sendError = (res: Response, error: unknown) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: "Invalid input", details: error.flatten() });
  }

  if (isKnownPrismaError(error)) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Advertisement not found" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Invalid foreign key" });
    }
  }

  return res.status(500).json({ error: "Internal server error" });
};

advertisementRouter.post("/", async (req, res) => {
  try {
    const data = createAdvertisementSchema.parse(req.body);

    const created = await prisma.advertisement.create({
      data: {
        advertiserId: data.advertiserId,
        title: data.title,
        description: data.description,
        price: data.price,
        conditions: data.conditions,
        categoryId: data.categoryId,
        status: data.status,
        pictures: data.pictures?.length
          ? { create: data.pictures.map((url) => ({ url })) }
          : undefined,
      },
      include: { pictures: true },
    });

    return res.status(201).json(created);
  } catch (error) {
    return sendError(res, error);
  }
});

advertisementRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const data = updateAdvertisementSchema.parse(req.body);
    const { pictures, ...fields } = data;

    const updated = await prisma.advertisement.update({
      where: { id },
      data: {
        ...fields,
        pictures: pictures
          ? { deleteMany: {}, create: pictures.map((url) => ({ url })) }
          : undefined,
      },
      include: { pictures: true },
    });

    return res.json(updated);
  } catch (error) {
    return sendError(res, error);
  }
});

advertisementRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    await prisma.$transaction([
      prisma.advertisementPicture.deleteMany({ where: { advertisementId: id } }),
      prisma.review.deleteMany({ where: { advertisementId: id } }),
      prisma.complaint.deleteMany({ where: { advertisementId: id } }),
      prisma.advertisement.delete({ where: { id } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
});
