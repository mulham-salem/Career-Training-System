import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendStatusUpdateEmail } from "../services/email/sendStatusUpdateEmail";
import { createNotification } from "../services/notification/notificationService";

const prisma = new PrismaClient();

/**
 * @desc Review applicants for jobs/trainings
 * @route  GET /api/applicant/fetch?type={type}
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const getApplicantsForOpportunities = async ( req: Request, res: Response): Promise<void> => {
  try {
    const employerId = Number((req as any).user.id);
    const { type } = req.query;

    if (type !== "job" && type !== "training") {
      res
        .status(400)
        .json({ message: "Invalid type. Must be 'job' or 'training'." });
      return;
    }

    // Verify that the company exists
    const company = await prisma.user.findFirst({
      where: { id: employerId },
    });
    if (!company) {
      res.status(403).json({ message: "Employer not found" });
      return;
    }

    // Fetch all jobs and trainings that belongs to the company
    const applications =
      type === "job"
        ? await prisma.application.findMany({
            where: {
              job: { companyId: company.id },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  skills: { include: { skill: true } },
                  profile: true,
                },
              },
              job: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : await prisma.application.findMany({
            where: {
              training: { companyId: company.id },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  skills: { include: { skill: true } },
                  profile: true,
                },
              },
              training: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
          });

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

/**
 * @desc Filter applicants for jobs/trainings by skills
 * @route  GET /api/applicant/filter?skillName={skillName}
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const filterApplicantsBySkill = async ( req: Request, res: Response): Promise<void> => {
  try {
    const employerId = Number((req as any).user.id);
    const { skillName } = req.query;

    if (!skillName) {
      res.status(400).json({ message: "Skill name is required for filtering" });
      return;
    }

    // Verify that the company exists
    const company = await prisma.user.findFirst({
      where: { id: employerId },
    });
    if (!company) {
      res.status(403).json({ message: "Employer not found" });
      return;
    }

    // Fetch all applicants with required skills
    const applicants = await prisma.application.findMany({
      where: {
        OR: [
          { job: { companyId: company.id } },
          { training: { companyId: company.id } },
        ],
        user: {
          skills: {
            some: {
              skill: {
                name: {
                  contains: String(skillName),
                },
              },
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            skills: { include: { skill: true } },
            profile: true,
          },
        },
        job: { select: { title: true } },
        training: { select: { title: true } },
      },
    });
    res.json({ applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to filter applicants by skill" });
  }
};

/**
 * @desc Update application status (ACCEPTED / REJECTED)
 * @route  PUT /api/applicant/update-status/:id
 * @access Private
 * @role (EMPLOYER)
 * @param req
 * @param res
 */
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify the application existing
    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { user: true, job: true, training: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Update application's status
    const updated = await prisma.application.update({
      where: { id: Number(id) },
      data: { status },
    });

    let title: string | undefined;
    let type: "job" | "training" | undefined;

    if (application.job) {
      title = application.job!.title;
      type = "job";
    }
    else {
      title = application.training!.title;
      type = "training";
    }

    // Send Notification to jobSeeker
    await createNotification({
      userId: application.user.id,
      title: "Application Status Updated",
      message: `The status of your application for ${title} has been updated to ${status}. Check the details.`,
    });

    // Send Email to jobSeeker
    await sendStatusUpdateEmail(
        application.user.id,
        application.user.name,
        title,
        type,
        status
    );

    res.status(200).json({
      message: `Application status updated to ${status}`,
      application: updated,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
