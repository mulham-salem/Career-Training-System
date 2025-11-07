import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendApplicationEmails } from "../services/email/sendApplicationEmails";
import { createNotification } from "../services/notification/notificationService";


const prisma = new PrismaClient();

/**
 * @desc Send confirmation/inform emails when jobSeeker apply on opportunity
 * @param userId
 * @param jobId
 * @param trainingId
 */
const handleApplicationEmails = async (userId: number, jobId?: number, trainingId?: number): Promise<void> => {

  const jobSeeker = await prisma.user.findUnique({ where: { id: userId } });

  let employer;
  let title: string | undefined;
  let type: "job" | "training" | undefined;

  if (jobId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true, },
    });
    employer = job?.company;
    title = job?.title;
    type = "job";
  } else if (trainingId) {
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: { company: true },
    });
    employer = training?.company;
    title = training?.title;
    type = "training";
  }

  if (!jobSeeker || !employer || !title || !type) return;

  await sendApplicationEmails(
      jobSeeker.id,
      jobSeeker.name,
      employer.id,
      employer.name,
      title,
      type
  );
};

/**
 * @desc Send notification to employer when a jobSeeker applied on their opportunities
 * @param applicationId
 */
const handleApplicationNotifications = async (applicationId: number): Promise<void> => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { company: true } },
      training: { include: { company: true } },
      user: true
    },
  });

  if (!application) return;

  let employer, title;
  if (application.job) {
    employer = application.job.company;
    title = application.job.title;
  } else if (application.training) {
    employer = application.training.company;
    title = application.training.title;
  }

  await createNotification({
    userId: employer!.id,
    title: "New Application Received",
    message: `${application.user.name} has applied for your opportunity: ${title}. Review their application.`,
  });
};

/**
 * @desc Fetch all job & training opportunities without filters
 * @route GET /api/opportunity/browse
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const browseOpportunities = async ( req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      include: { company: { select: { name: true } } },
    });

    const trainings = await prisma.training.findMany({
      include: { company: { select: { name: true } } },
    });

    res.json({ jobs, trainings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch opportunities" });
  }
};

/**
 * @desc Fetch a certain job or training opportunity using keywords and filters
 * @route GET /api/opportunity/search?keyword={keyword}&type={type}&location={location}
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const searchOpportunities = async ( req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, type, location } = req.query;

    // Search Jobs
    let jobs: any[] = [];
    if ( keyword || type || location ) {
      jobs = await prisma.job.findMany({
        where: {
          AND: [
            keyword
              ? {
                  OR: [
                    {
                      title: {
                        contains: String(keyword),
                      },
                    },
                    {
                      description: {
                        contains: String(keyword),
                      },
                    },
                  ],
                }
              : {},
            type ? { type: String(type) } : {},
            location
              ? {
                  location: {
                    contains: String(location),
                  },
                }
              : {},
          ],
        },
        include: { company: { select: { name: true } } },
      });
    }

    // Search Trainings
    let trainings: any[] = [];
    if (keyword) {
      trainings = await prisma.training.findMany({
        where: {
          AND: [
            keyword
              ? {
                  OR: [
                    {
                      title: {
                        contains: String(keyword),
                      },
                    },
                    {
                      description: {
                        contains: String(keyword),
                      },
                    },
                  ],
                }
              : {},
          ],
        },
        include: { company: { select: { name: true } } },
      });
    }

    res.json({ jobs, trainings });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to search opportunities", err: err });
  }
};

/**
 * @desc Applying for job or training opportunity
 * @route POST /api/opportunity/apply
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const applyForOpportunities = async ( req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number((req as any).user.id);
    const { jobId, trainingId } = req.body;

    if (!jobId && !trainingId) {
      res.status(400).json({ message: "Job ID or Training ID is required" });
      return;
    }

    const existing = await prisma.application.findFirst({
      where: {
        userId,
        OR: [{ jobId }, { trainingId }],
      },
    });

    if (existing) {
      res
        .status(400)
        .json({ message: "You already applied for this opportunity" });
      return;
    }

    const newApp = await prisma.application.create({
      data: {
        userId,
        jobId,
        trainingId,
      },
    });

    // Send Notifications to employer when jobSeeker applied on their opportunity
    await handleApplicationNotifications(newApp.id);

    // Send Emails to jobSeeker & employer when jobSeeker applied on their opportunity
    await handleApplicationEmails(userId, jobId, trainingId);

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApp,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to apply for opportunity" });
  }
};

/**
 * @desc Track user's applications status for applied job & training opportunities
 * @route GET /api/opportunity/applications
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const getUserApplications = async ( req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number((req as any).user.id);

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: { select: { title: true } },
        training: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/**
 * @desc Send smart recommendations for suitable job & training opportunities
 * @route GET /api/opportunity/recommendations
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const getUserRecommendations = async ( req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number((req as any).user.id);

    // 1. Fetch user's info with skills and previous applications
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        applications: {
          include: {
            job: { select: { id: true, title: true, description: true } },
            training: { select: { id: true, title: true, description: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Extract skills as array of string
    const skillNames = user.skills.map((s) => s.skill.name.toLowerCase());

    // Extract previous applications that user applied for it to avoid repetition
    const appliedJobIds = user.applications
      .map((a) => a.jobId)
      .filter((id): id is number => id != null);

    const appliedTrainingIds = user.applications
      .map((a) => a.trainingId)
      .filter((id): id is number => id != null);

    // 2. Search for opportunities similar to user's skills
    const recommendedJobs = await prisma.job.findMany({
      where: {
        AND: [
          {
            OR: skillNames.map((name) => ({
              OR: [
                { title: { contains: name } },
                { description: { contains: name } },
              ],
            })),
          },
          { id: { notIn: appliedJobIds } },
        ],
      },
      include: { company: { select: { name: true } } },
      take: 10,
    });

    const recommendedTrainings = await prisma.training.findMany({
      where: {
        AND: [
          {
            OR: skillNames.map((name) => ({
              OR: [
                { title: { contains: name } },
                { description: { contains: name } },
              ],
            })),
          },
          { id: { notIn: appliedTrainingIds } },
        ],
      },
      include: { company: { select: { name: true } } },
      take: 10,
    });

    // 3. Sort result (optional) by frequently used skills or location
    const location = user.profile?.location?.toLowerCase() || "";
    const locationMatchedJobs = recommendedJobs.filter((j) =>
      j.location?.toLowerCase()?.includes(location)
    );
    const locationMatchedTrainings = recommendedTrainings.filter((t) =>
      t.description.toLowerCase().includes(location)
    );

    // Combine and arrange according to importance (location first, then skill).
    const sortedJobs = [...locationMatchedJobs, ...recommendedJobs];
    const sortedTrainings = [
      ...locationMatchedTrainings,
      ...recommendedTrainings,
    ];

    res.json({
      message: "Smart recommendations generated successfully",
      recommendations: {
        jobs: sortedJobs,
        trainings: sortedTrainings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
};
