import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType } from "../types";
import { securityService } from "./securityService";

// Helper to clean base64 string
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1] || dataUrl;
};

// Helper to determine mime type
const getMimeType = (dataUrl: string) => {
  return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
};

/**
 * Get API Key Strategy:
 * 1. Check for Admin-configured Global Key in LocalStorage (Commercial Mode) - DECRYPT IT FIRST
 * 2. Fallback to process.env.API_KEY (Development/Environment Mode)
 */
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    // Attempt to get the encrypted key
    const encryptedKey = localStorage.getItem(securityService.STORAGE_KEY);
    
    // Legacy support: check for old plain text key and migrate/warn if needed, 
    // or just prefer the new one.
    if (encryptedKey) {
      const decrypted = securityService.decrypt(encryptedKey);
      if (decrypted) return decrypted;
    }

    // Fallback: Check if there is an old unencrypted key (for backward compatibility during migration)
    // In production, you might want to remove this fallback.
    const oldKey = localStorage.getItem('nova_global_api_key');
    if (oldKey && !encryptedKey) {
       return oldKey;
    }
  }
  return process.env.API_KEY || '';
};

/**
 * Generate Text with System Instructions (Gemini 3 Pro)
 */
export const generateTextResponse = async (
  prompt: string,
  systemInstruction: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const chat = ai.chats.create({
      model: ModelType.GEMINI_3_PRO,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({
      message: prompt
    });

    return response.text || "No response text generated.";
  } catch (error) {
    console.error("Text Generation Error:", error);
    throw error;
  }
};

/**
 * Concept Design / Style Transfer (Gemini 3 Pro Image or 2.5 Flash Image)
 * Takes multiple images + prompt + optional system instruction
 */
export const generateConceptDesign = async (
  prompt: string,
  images: string[], // Base64 Data URLs
  model: ModelType = ModelType.GEMINI_3_PRO_IMAGE,
  systemInstruction?: string
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    const imageParts = images.map((img) => ({
      inlineData: {
        data: cleanBase64(img),
        mimeType: getMimeType(img),
      },
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        systemInstruction: systemInstruction, // Inject GEM instruction
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback if model refuses to generate image but returns text explaining why
    if (response.text) {
      throw new Error(`Model returned text instead of image: ${response.text}`);
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Concept Design Error:", error);
    throw error;
  }
};

/**
 * Image Editing (Gemini 2.5 Flash Image)
 * Specific for "Add retro filter", "Remove person", etc.
 */
export const editImage = async (
  baseImage: string,
  instruction: string,
  systemInstruction?: string
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: ModelType.GEMINI_2_5_FLASH_IMAGE, // Best for instruction-following edits
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(baseImage),
              mimeType: getMimeType(baseImage),
            },
          },
          { text: instruction },
        ],
      },
      config: {
        systemInstruction: systemInstruction, // Inject GEM instruction
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
     if (response.text) {
      throw new Error(`Model returned text: ${response.text}`);
    }

    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};
