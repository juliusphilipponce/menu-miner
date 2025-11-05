import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Search Images API Route
 * 
 * Proxies requests to Google Custom Search API to find images for menu items.
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
    const { itemName, restaurantName, numImages = 10 } = req.body;
    
    // Validate inputs
    if (!itemName || !restaurantName) {
      return res.status(400).json({ error: 'Missing required fields: itemName and restaurantName' });
    }

    // Validate input types
    if (typeof itemName !== 'string' || typeof restaurantName !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    // Validate input lengths
    if (itemName.length > 200 || restaurantName.length > 200) {
      return res.status(400).json({ error: 'Input too long (max 200 characters)' });
    }

    // Validate and limit number of images
    const validatedNumImages = Math.max(1, Math.min(10, Number(numImages) || 10));

    // Get API credentials from environment (server-side only)
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) {
      console.error('Google Search API credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Build search query
    const searchQuery = `${restaurantName} ${itemName} food`;
    const query = encodeURIComponent(searchQuery);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=${validatedNumImages}&imgType=photo&imgSize=large&imgColorType=color`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Google Search API error: ${response.status} ${response.statusText}`);
      
      // Handle quota exceeded
      if (response.status === 429) {
        return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
      }
      
      return res.status(response.status).json({ error: 'Search API error' });
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      return res.status(500).json({ error: 'Invalid API response' });
    }

    // Extract image URLs
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      const imageUrls = data.items
        .map((item: any) => item?.link)
        .filter((link: any): link is string => {
          if (typeof link !== 'string') return false;
          // Basic URL validation
          try {
            new URL(link);
            return link.startsWith('http://') || link.startsWith('https://');
          } catch {
            return false;
          }
        })
        .slice(0, validatedNumImages);

      return res.status(200).json({ imageUrls });
    }

    // No images found
    return res.status(200).json({ imageUrls: [] });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

