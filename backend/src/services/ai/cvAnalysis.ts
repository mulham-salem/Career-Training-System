import { callAI } from "./aiService";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const analyzeCV = async (
  userId: number,
  options: {
    fileBuffer?: Buffer;
    cvText?: string;
  }
): Promise<any> => {
  let cvText = options.cvText;

  // Convert pdf to text
  if (options.fileBuffer) {
     cvText = await extractTextFromPDF(options.fileBuffer);
  }

  if (!cvText || cvText.trim().length === 0) {
    throw new Error("No CV content provided.");
  }

  const prompt = `
      Analyze the following CV and provide:
      - Strengths
      - Weaknesses
      - Missing skills for the job market
      - Suggestions for improvement
    
      CV Content:
      ${cvText}
    `;

  const response = await callAI(prompt);

  await prisma.aIRecommendation.create({
    data: { userId, type: "cv_analysis", content: response },
  });

  return response;
};

/**
 * @desc Extracts text from a PDF buffer using pdfjs-dist
 */
export const extractTextFromPDF = async (fileBuffer: Buffer): Promise<string> => {

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fileBuffer),
  });

  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  // Clean the extracted text from extra spaces
  fullText = fullText
      .split("\n")
      .map(line => line.trim().replace(/\s+/g, " "))
      .filter(line => line.length > 0)
      .join("\n");

  return fullText;
};