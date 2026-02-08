
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateRecipe = async (ingredients: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `다음 재료들을 활용하거나 기반으로 하여 전문적인 요리 레시피를 만들어주세요: ${ingredients}. 모든 응답(제목, 설명, 재료 리스트, 조리 방법 등)은 반드시 한국어로 작성해야 합니다. JSON 형식으로 제공하세요.`,
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
  if (!text) throw new Error("AI로부터 응답을 받지 못했습니다.");
  return JSON.parse(text);
};

export const generateInitialImage = async (dishTitle: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional food photography shot of a dish named "${dishTitle}". High resolution, appetizing, gourmet presentation, soft cinematic lighting, 4k.` }
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
  throw new Error("이미지 생성에 실패했습니다.");
};

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
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
        { text: `Modify this food image according to this request: ${prompt}. Maintain the food's identity but change the style or environment as requested.` },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("이미지 수정에 실패했습니다.");
};
