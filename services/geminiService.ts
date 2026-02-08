
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateRecipe = async (ingredients: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a professional cooking recipe using some or all of these ingredients: ${ingredients}. Provide the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          instructions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          prepTime: { type: Type.STRING },
          servings: { type: Type.NUMBER }
        },
        required: ["title", "description", "ingredients", "instructions", "prepTime", "servings"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
};

export const generateInitialImage = async (dishTitle: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional food photography shot of ${dishTitle}. High resolution, appetizing, gourmet presentation, soft lighting.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // Remove data:image/png;base64, prefix if it exists
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to edit image");
};
