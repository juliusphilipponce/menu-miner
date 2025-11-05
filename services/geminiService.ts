import { GoogleGenAI, Type } from "@google/genai";
import type { MenuItem } from '../types';
import { validateImageFile } from '../utils/security';

const menuSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the menu item." },
      description: { type: Type.STRING, description: "A brief description of the menu item." },
      price: { type: Type.STRING, description: "The price of the menu item as a string." }
    },
    required: ["name", "description", "price"]
  }
};

/**
 * Analyze menu with Gemini AI
 *
 * In development: Calls Gemini API directly
 * In production: Calls serverless function
 */
export const analyzeMenuWithGemini = async (imageFile: File): Promise<MenuItem[]> => {
  // Security: Validate image file
  const fileValidation = validateImageFile(imageFile);
  if (!fileValidation.valid) {
    throw new Error(`Invalid image file: ${fileValidation.error}`);
  }

  const isDev = import.meta.env.DEV;

  try {
    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove the "data:mime/type;base64," prefix
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to read file as data URL."));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(imageFile);
    });

    if (isDev) {
      // Development mode: Call Gemini API directly
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY not configured in .env.local");
      }

      const ai = new GoogleGenAI({ apiKey });

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      };

      const prompt = "Extract all menu items from this image. For each item, provide its name, a brief description, and its price. If a description is not available, create a concise, plausible one. Ensure the output is a valid JSON array of objects, where each object represents a menu item.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: menuSchema,
        },
      });

      const jsonText = response.text.trim();

      // Validate response size
      if (jsonText.length > 1000000) {
        throw new Error('Response too large');
      }

      const parsedJson = JSON.parse(jsonText);

      // Validate response is an array
      if (!Array.isArray(parsedJson)) {
        throw new Error('Invalid response format');
      }

      // Limit number of items
      if (parsedJson.length > 100) {
        throw new Error('Too many items (max 100)');
      }

      return parsedJson as MenuItem[];

    } else {
      // Production mode: Call serverless function
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: imageFile.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid response format from server");
      }

      return data.items as MenuItem[];
    }

  } catch (error) {
    console.error("Error analyzing menu:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze menu: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the menu.");
  }
};
