import { callAI } from "./aiService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const suggestCareerPaths = async (userId: number, userData: Record<string, any> ): Promise<any> => {
  const prompt = `
    Based on the following user profile, suggest 3-5 possible career paths.
    User profile:
    ${JSON.stringify(userData, null, 2)}
    Provide structured recommendations (title + short description for each path).
  `;

  const response = await callAI(prompt);

  await prisma.aIRecommendation.create({
    data: { userId, type: "career_path", content: response },
  });

  return response;
};
