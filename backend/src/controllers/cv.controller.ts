import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

/**
 * @desc Upload user's CV
 * @route POST /api/cv/upload
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const uploadCV = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const file = (req as any).file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const cv = await prisma.cV.create({
      data: {
        userId,
        url: `uploads/cvs/${file.filename}`,
      },
    });

    return res.status(201).json({ message: "CV uploaded successfully", cv });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error uploading CV" });
  }
};

/**
 * @desc Get user's CV
 * @route GET /api/cv/view
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const getMyCV = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const cv = await prisma.cV.findUnique({ where: { userId } });

    if (!cv) {
      return res.status(404).json({ message: "No CV found for this user" });
    }

    return res.status(200).json({ message: "CV fetched successfully", cv });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching CV" });
  }
};

/**
 * @desc Update user's CV
 * @route PUT /api/cv/update/:id
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const updateCV = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const cvId = Number(req.params.id);
    const file = (req as any).file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const existingCV = await prisma.cV.findUnique({ where: { id: cvId } });

    if (!existingCV || existingCV.userId !== userId) {
      return res
        .status(404)
        .json({ message: "CV not found or not authorized" });
    }

    // حذف الملف القديم
    const oldPath = path.join(__dirname, "../../", existingCV.url);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    // تحديث قاعدة البيانات
    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: { url: `uploads/cvs/${file.filename}` },
    });

    return res.status(200).json({ message: "CV updated successfully", updatedCV });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error occurred updating CV" });
  }
};

/**
 * @desc Delete user's CV
 * @route DELETE /api/cv/delete/:id
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const deleteCV = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const cvId = Number(req.params.id);

    const existingCV = await prisma.cV.findUnique({ where: { id: cvId } });

    if (!existingCV || existingCV.userId !== userId)
      return res
        .status(404)
        .json({ message: "CV not found or not authorized" });

    const filePath = path.join(__dirname, "../../", existingCV.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.cV.delete({ where: { id: cvId } });

    return res.status(200).json({ message: "CV deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting CV" });
  }
};