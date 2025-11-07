import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendNewOpportunityEmail } from "../services/email/sendNewOpportunityEmail";
import { createNotification } from "../services/notification/notificationService";

const prisma = new PrismaClient();

/**
 * @desc Post a new job
 * @route POST /api/job/create
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, location, type } = req.body;
    const companyId = Number((req as any).user.id);

    const job = await prisma.job.create({
      data: { title, description, location, type, companyId },
    });

    // Fetch All Job Seekers preparing to send them notifications
    const jobSeekers = await prisma.user.findMany({
      where: { role: "JOB_SEEKER" },
    });

    for (const user of jobSeekers) {
      await createNotification({
        userId: user.id,
        title: "New Opportunity Available",
        message: `A new opportunity has been posted: ${job.title}. Check it out now!`,
      });
    }

    // Send confirmation email to employer
    const employer = await prisma.user.findUnique({ where: { id: companyId } });
    await sendNewOpportunityEmail(employer!.id, employer!.name, title, "job");

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error posting job", error: err });
  }
};

/**
 * @desc View all jobs
 * @route GET /api/job/view
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const getMyJobs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employerId = Number((req as any).user.id);
    const jobs = await prisma.job.findMany({
      where: { companyId: employerId },
      orderBy: { createdAt: "desc" },
    });
    if (!jobs) return res.status(404).json({ message: "Jobs not found" });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching jobs", error: err });
  }
};

/**
 * @desc Update a job
 * @route PUT /api/job/edit/:id
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const updateJob = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { title, description, location, type } = req.body;

  try {
    const job = await prisma.job.findUnique({ where: { id: Number(id) } });
    if (!job) return res.status(404).json({ message: "Job not found" });
    if ( job.companyId !== Number((req as any).user.id) )
      return res
        .status(403)
        .json({ message: "Not authorized to edit this job" });

    const update = await prisma.job.update({
      where: { id: Number(id) },
      data: { title, description, location, type },
    });

    return res.json({ message: "Job updated successfully", update });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating job", error: err });
  }
};

/**
 * @desc Delete a job
 * @route DELETE /api/job/delete/:id
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const deleteJob = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const job = await prisma.job.findUnique({ where: { id: Number(id) } });
    if (!job) return res.status(404).json({ message: "Job not found" });
    if ( job.companyId !== Number((req as any).user.id) )
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });

    await prisma.job.delete({ where: { id: Number(id) } });
    return res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting job", error: err });
  }
};