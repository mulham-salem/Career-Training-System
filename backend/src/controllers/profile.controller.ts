import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc Upsert (update or create it) user profile
 * @route POST /api/profile/upsert
 * @access Private
 * @role (JOB_SEEKER - EMPLOYER)
 * @param req
 * @param res
 */
export const upsertProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: number = Number((req as any).user.id);

  const { bio, location, website, phone, experience, education } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { bio, location, website, phone, experience, education },
      create: { userId, bio, location, website, phone, experience, education },
    });

    res.json(profile);
  } catch (error: any) {
    console.log("Error occurred during upsert profile: ", error);
    res.status(500).json({
      message: "Server error while editing profile",
      error: error.message,
    });
  }
};


/**
 * @desc Get user profile
 * @route GET /api/profile/view
 * @access Private
 * @role (JOB_SEEKER - EMPLOYER)
 * @param req
 * @param res
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: number = Number((req as any).user.id);

  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.json(profile);
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching profile: ", error: error.message });
  }
};