import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY!;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

interface AIMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AIQueryData {
  messages: AIMessage[];
  model: string;
}

export const callAI = async (prompt: string, model: string = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"): Promise<any> => {
  try {
    const data: AIQueryData = {
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model,
    };

    const response = await axios.post(HF_API_URL, data, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data?.choices?.[0]?.message?.content || "No response";
  } catch (err) {
    console.error("Hugging Face API Error:", err);
    throw new Error("Failed to connect to Hugging Face API");
  }
};
