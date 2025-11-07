import { Request, Response } from 'express';
import { suggestCareerPaths } from "../services/ai/careerPath";
import { suggestLearningPlan } from "../services/ai/learningPlan";
import { analyzeCV } from "../services/ai/cvAnalysis";
import { provideCareerAdvice } from "../services/ai/careerAdvice";

/**
 * @desc Suggests suitable career paths for the user based on their profile (skills, interests, and experience).
 * @route POST /api/ai/career-paths
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const handleCareerPaths = async (req: Request, res: Response): Promise<void> => {
    const { userId, userData } = req.body;
    const result = await suggestCareerPaths(Number(userId), userData);
    res.json({ result });
}

/**
 * @desc Provides a personalized learning/training plan for the user to achieve their career goal.
 * @route POST /api/ai/learning-plan
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const handleLearningPlan = async (req: Request, res: Response): Promise<void> => {
    const { userId, goal } = req.body;
    const result = await suggestLearningPlan(Number(userId), goal);
    res.json({ result });
};

/**
 * @desc Analyzes the user's CV (text or PDF) to identify strengths, weaknesses, missing skills, and improvement suggestions.
 * @route POST /api/ai/cv-analysis
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const handleCVAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.body.userId);
        let result;

        if (req.body.cvText) {
            result = await analyzeCV(userId, { cvText: req.body.cvText });
        } else if (req.file) {
            result = await analyzeCV(userId, { fileBuffer: req.file.buffer });
        } else {
             res.status(400).json({ message: "Please provide either cvText or a PDF file." });
             return;
        }
        res.json({ result });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message || "Analysis failed" });
    }
};

/**
 * @desc Provides intelligent career advice to the user based on their question (e.g., skill development, career choice, improving job prospects).
 * @route POST /api/ai/career-advice
 * @access Private
 * @role (JOB_SEEKER)
 * @param req
 * @param res
 */
export const handleCareerAdvice = async (req: Request, res: Response): Promise<void> => {
    const { userId, question } = req.body;
    const result = await provideCareerAdvice(Number(userId), question);
    res.json({ result });
};