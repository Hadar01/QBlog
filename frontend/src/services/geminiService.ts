import { GoogleGenAI } from "@google/genai";

// We check if the key is available in environment, otherwise we might rely on a passed key
const getClient = () => {
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    throw new Error("Gemini API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceContent = async (text: string, mode: 'summarize' | 'improve' | 'expand'): Promise<string> => {
  try {
    const ai = getClient();
    const modelId = 'gemini-3-flash-preview'; 

    let prompt = "";
    switch (mode) {
      case 'summarize':
        prompt = "Create a concise, engaging summary (max 2 sentences) for the following blog post content:";
        break;
      case 'improve':
        prompt = "Fix the grammar, improve the flow, and make the following text sound more professional but keep the personal tone. Return ONLY the improved text, no explanations:";
        break;
      case 'expand':
        prompt = "Expand on the following key points to create a short blog paragraph:";
        break;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: `${prompt}\n\n"${text}"` }] }
      ]
    });

    return response.text || text; 
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTags = async (text: string): Promise<string[]> => {
  try {
    const ai = getClient();
    const modelId = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: `Generate 3-5 relevant, short tags for the following blog post content. Return them as a comma-separated list (e.g. React, Coding, Web Dev). Do not include hash symbols.\n\nContent: "${text.substring(0, 1000)}..."` }] }
      ]
    });

    const rawTags = response.text || "";
    return rawTags.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Gemini Tag Error:", error);
    return [];
  }
};
