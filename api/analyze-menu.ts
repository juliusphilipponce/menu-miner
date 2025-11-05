import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
 * Analyze Menu API Route
 * 
 * Proxies requests to Google Gemini API to extract menu items from images.
 * API keys are kept server-side for security.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, mimeType } = req.body;
    
    // Validate input
    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields: imageData and mimeType' });
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' });
    }

    // Validate file size (10MB limit)
    const sizeInBytes = (imageData.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
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
    
    // Validate response size (1MB limit)
    if (jsonText.length > 1000000) {
      return res.status(500).json({ error: 'Response too large' });
    }

    const parsedJson = JSON.parse(jsonText);

    // Validate response is an array
    if (!Array.isArray(parsedJson)) {
      return res.status(500).json({ error: 'Invalid response format' });
    }

    // Limit number of items
    if (parsedJson.length > 100) {
      return res.status(500).json({ error: 'Too many items (max 100)' });
    }

    return res.status(200).json({ items: parsedJson });
    
  } catch (error) {
    console.error('Error analyzing menu:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

