import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * @desc Create a new user
 * @route POST /api/admin/add-user
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const addUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role)
            return res.status(400).json({ message: "All fields are required." });

        // Verify the email is unique
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: "Email already in use." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });

        return res.status(201).json({ message: "User created successfully.", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc Fetch all users
 * @route GET /api/admin/users
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const adminId = Number((req as any).user.id);

        const users = await prisma.user.findMany({
            where: {
                id: { not: adminId },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc Update a certain user
 * @route PUT /api/admin/edit-user/:id
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found." });

        let hashedPassword = user.password;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        const updated = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                name: name ?? user.name,
                email: email ?? user.email,
                password: hashedPassword,
                role: role ?? user.role,
            },
        });

        return res.json({ message: "User updated successfully.", updated });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * @desc Delete a certain user
 * @route DELETE /api/admin/delete-user/:id
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found." });

        await prisma.user.delete({ where: { id: Number(id) } });

        return res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc Get all jobs and trainings with applicants count
 * @route GET /api/admin/opportunities
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const getOpportunities = async (req: Request, res: Response): Promise<void> => {
    try {
        // 🔹 Get all jobs with applicants count
        const jobs = await prisma.job.findMany({
            include: {
                company: { select: { name: true, email: true } },
                _count: { select: { applications: true } }, // ⬅ عدد المتقدمين
            },
            orderBy: { createdAt: "desc" },
        });

        // 🔹 Get all trainings with applicants count
        const trainings = await prisma.training.findMany({
            include: {
                company: { select: { name: true, email: true } },
                _count: { select: { applications: true } }, // ⬅ عدد المتقدمين
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ jobs, trainings });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch opportunities", error });
    }
}

/**
 * @desc Delete a certain job
 * @route DELETE /api/admin/delete-job/:id
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const job = await prisma.job.findUnique({ where: { id: Number(id) } });
        if (!job) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        await prisma.job.delete({ where: { id: Number(id) } });
        res.json({ message: "Job deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * @desc Delete a certain training
 * @route DELETE /api/admin/delete-training/:id
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const deleteTraining = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const training = await prisma.training.findUnique({ where: { id: Number(id) } });
        if (!training) {
            res.status(404).json({ message: "Training not found" });
            return;
        }

        await prisma.training.delete({ where: { id: Number(id) } });
        res.json({ message: "Training deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

/**
 * @desc Generate System Report
 * @route GET /api/admin/report
 * @access Private
 * @role (ADMIN)
 * @param req
 * @param res
 */
export const generateSystemReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const adminId = Number((req as any).user.id);

        // Users Statistics
        const totalUsers = await prisma.user.count();
        const usersByRole = await prisma.user.groupBy({
           by: ["role"],
           _count: { role: true },
        });

        // Jobs and Trainings Statistics
        const totalJobs = await prisma.job.count();
        const totalTrainings = await prisma.training.count();

        // Count of job & training applications
        const jobApplications = await prisma.application.count({
            where: { jobId: { not: null } },
        });
        const trainingApplications = await prisma.application.count({
            where: { trainingId: { not: null } },
        });
        const totalApplications = jobApplications + trainingApplications;

        // Content of report (textually)
        const content = `
          📊 System Overview Report
          --------------------------
          👥 Total Users: ${totalUsers}
             - JOB_SEEKER: ${usersByRole.find(u => u.role === "JOB_SEEKER")?._count.role || 0}
             - EMPLOYER: ${usersByRole.find(u => u.role === "EMPLOYER")?._count.role || 0}
             - ADMIN: ${usersByRole.find(u => u.role === "ADMIN")?._count.role || 0}
          
          💼 Total Jobs: ${totalJobs}
          📚 Total Trainings: ${totalTrainings}
          
          📄 Applications:
             - For Jobs: ${jobApplications}
             - For Trainings: ${trainingApplications}
             - Total: ${totalApplications}
          
          🕒 Generated At: ${new Date().toLocaleString()}
    `;

        const report = await prisma.report.create({
          data: {
            adminId,
            title: `System Report - ${new Date().toLocaleDateString()}`,
            content,
          },
        });

      res.status(201).json({
        message: "Report generated successfully",
        report,
        stats: {
          totalUsers,
          usersByRole,
          totalJobs,
          totalTrainings,
          jobApplications,
          trainingApplications,
          totalApplications,
        },
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Server error" });
    }
};
