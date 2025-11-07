import { callAI } from "./aiService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const provideCareerAdvice = async (userId: number, question: string): Promise<any> => {
  const prompt = `
    Provide practical and motivational career advice for the following question:
    "${question}"
  `;

  const response = await callAI(prompt);

  await prisma.aIRecommendation.create({
    data: { userId, type: "career_advice", content: response },
  });

  return response;
};
