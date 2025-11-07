import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendNewOpportunityEmail } from "../services/email/sendNewOpportunityEmail";
import { createNotification } from "../services/notification/notificationService";

const prisma = new PrismaClient();

/**
 * @desc Post a new training
 * @route POST /api/training/create
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const createTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, duration } = req.body;
    const companyId = Number((req as any).user.id);

    const training = await prisma.training.create({
      data: { title, description, duration, companyId },
    });

    // Fetch All Job Seekers preparing to send them notifications
    const jobSeekers = await prisma.user.findMany({
      where: { role: "JOB_SEEKER" },
    });

    for (const user of jobSeekers) {
      await createNotification({
        userId: user.id,
        title: "New Opportunity Available",
        message: `A new opportunity has been posted: ${training.title}. Check it out now!`,
      });
    }

    // Send confirmation email to employer
    const employer = await prisma.user.findUnique({ where: { id: companyId } });
    await sendNewOpportunityEmail(employer!.id, employer!.name, title, "training");

    res.status(201).json({ message: "Training posted successfully", training });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error posting training", error: err });
  }
};

/**
 * @desc View all trainings
 * @route GET /api/training/view
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const getMyTrainings = async (req: Request,res: Response): Promise<Response> => {
  try {
    const employerId = Number((req as any).user.id);
    const trainings = await prisma.training.findMany({
      where: { companyId: employerId },
      orderBy: { createdAt: "desc" },
    });
    if (!trainings) return res.status(404).json({ message: "Training not found" });
    return res.status(200).json(trainings);
  } catch (err) {
    console.error(err);
    return res
        .status(500)
        .json({ message: "Error fetching training", error: err });
  }
};

/**
 * @desc Update a training
 * @route PUT /api/training/edit/:id
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const updateTraining = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { title, description, duration } = req.body;

  try {
    const training = await prisma.training.findUnique({
      where: { id: Number(id) },
    });
    if (!training)
      return res.status(404).json({ message: "Training not found" });
    if ( training.companyId !== Number((req as any).user.id) )
      return res
        .status(403)
        .json({ message: "Not authorized to edit this training" });
    const update = await prisma.training.update({
      where: { id: Number(id) },
      data: { title, description, duration },
    });
    return res.json({ message: "Training updated successfully", update });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating training", error: err });
  }
};

/**
 * @desc Delete a training
 * @route DELETE /api/training/edit/:id
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const deleteTraining = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const training = await prisma.training.findUnique({
      where: { id: Number(id) },
    });
    if (!training)
      return res.status(404).json({ message: "Training not found" });
    if ( training.companyId !== Number((req as any).user.id) )
      return res
        .status(403)
        .json({ message: "Not authorized to delete this training" });

    await prisma.training.delete({ where: { id: Number(id) } });
    return res.json({ message: "Training deleting successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error deleting training", error: err });
  }
};