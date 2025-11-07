import { callAI } from "./aiService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const suggestLearningPlan = async (userId: number, goal: string): Promise<any> => {
  const prompt = `
    Create a personalized 4-week learning and training plan for someone aiming to become ${goal}.
    Include weekly goals, topics, and practical exercises.
  `;

  const response = await callAI(prompt);

  await prisma.aIRecommendation.create({
    data: { userId, type: "learning_plan", content: response },
  });

  return response;
};
