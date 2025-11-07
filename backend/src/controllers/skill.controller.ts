import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc Create new skills (if existed update it)
 * @param name
 */
const findOrCreateSkill = async (name: string): Promise<{ id: number; name: string }> => {
  let skill = await prisma.skill.findUnique({ where: { name } });
  if (!skill) {
    skill = await prisma.skill.create({ data: { name } });
  }
  return skill;
};

/**
 * @desc Upsert (update or create) user's skills
 * @route PUT /api/skill/upsert
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const upsertUserSkill = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    // 1. Create or found Skills
    const skillRecords = [];
    for (const skillName of skills) {
      const skill = await findOrCreateSkill(skillName);
      skillRecords.push(skill);
    }

    // 2. Delete old user's skills
    await prisma.userSkill.deleteMany({ where: { userId } });

    // 3. create new user's skills
    for (const skill of skillRecords) {
      await prisma.userSkill.create({
        data: {
          userId,
          skillId: skill.id,
        },
      });
    }

    // 4. Fetch user with his skills
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    return res.json({
      message: "User skills updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update skills" });
  }
};

/**
 * @desc View certain user's skills
 * @route GET /api/skill/view
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const getUserSkills = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = Number((req as any).user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const skills = user.skills.map( (us) => us.skill.name );
    return res.json({ userId, skills });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch user skills" });
  }
};
