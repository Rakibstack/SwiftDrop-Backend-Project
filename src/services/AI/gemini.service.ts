import { GoogleGenAI } from "@google/genai";
import config from "../../app/config";

const apiKey = config.gemini_api_key;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey });

const model = config.gemini_model ?? "gemini-3.8-flash";

type GenerateTextInput = {
  systemInstruction: string;
  prompt: string;
};

export const generateAIText = async ({
  systemInstruction,
  prompt,
}: GenerateTextInput): Promise<string> => {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.2,
      maxOutputTokens:500,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("AI returned an empty response");
  }

  return text;
};
