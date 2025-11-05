import type { MenuItem } from '../types';
import { sanitizeText, validateImageUrl } from '../utils/security';

/**
 * Fetch menu item images
 *
 * In development: Calls Google Search API directly
 * In production: Calls serverless function
 */
export const fetchMenuItemImages = async (
    itemName: string,
    restaurantName: string,
    numImages: number
): Promise<string[] | null> => {
    // Security: Sanitize inputs
    const sanitizedItemName = sanitizeText(itemName);
    const sanitizedRestaurantName = sanitizeText(restaurantName);

    if (!sanitizedItemName || !sanitizedRestaurantName) {
        console.warn("Invalid item name or restaurant name. Skipping image fetch.");
        return null;
    }

    // Security: Validate and limit number of images
    const validatedNumImages = Math.max(1, Math.min(10, numImages));

    const isDev = import.meta.env.DEV;

    try {
        if (isDev) {
            // Development mode: Call Google Search API directly
            const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
            const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;

            if (!apiKey || !cx) {
                console.warn("VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_CX not configured in .env.local");
                return null;
            }

            // Build search query
            const searchQuery = `${sanitizedRestaurantName} ${sanitizedItemName} food`;
            const query = encodeURIComponent(searchQuery);
            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=${validatedNumImages}&imgType=photo&imgSize=large&imgColorType=color`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Google Search API error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            // Validate response structure
            if (!data || typeof data !== 'object') {
                console.error('Invalid response data structure');
                return null;
            }

            // Extract image URLs
            if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                const validatedUrls = data.items
                    .map((item: any) => item?.link)
                    .filter((link: any): link is string => {
                        if (typeof link !== 'string') return false;
                        const validation = validateImageUrl(link);
                        return validation.valid;
                    })
                    .slice(0, validatedNumImages);

                return validatedUrls.length > 0 ? validatedUrls : [];
            }

            return [];

        } else {
            // Production mode: Call serverless function
            const response = await fetch('/api/search-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemName: sanitizedItemName,
                    restaurantName: sanitizedRestaurantName,
                    numImages: validatedNumImages,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error(`Image search error: ${errorData.error || response.statusText}`);
                return null;
            }

            const data = await response.json();

            // Validate response
            if (!data.imageUrls || !Array.isArray(data.imageUrls)) {
                console.error('Invalid response format from server');
                return null;
            }

            return data.imageUrls.length > 0 ? data.imageUrls : [];
        }

    } catch (error) {
        console.error("Error fetching menu item images:", error);
        return null;
    }
};

export const fetchImagesForAllItems = async (
    items: MenuItem[],
    restaurantName: string,
    numImages: number
): Promise<MenuItem[]> => {
    // Security: Validate inputs
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
    }

    if (items.length > 100) {
        throw new Error('Too many items to process (maximum 100)');
    }

    const sanitizedRestaurantName = sanitizeText(restaurantName);
    if (!sanitizedRestaurantName) {
        throw new Error('Invalid restaurant name');
    }

    const validatedNumImages = Math.max(1, Math.min(10, numImages));

    const itemsWithImages = await Promise.all(
        items.map(async (item) => {
            const imageUrls = await fetchMenuItemImages(item.name, sanitizedRestaurantName, validatedNumImages);
            return { ...item, imageUrls: imageUrls ?? undefined };
        })
    );
    return itemsWithImages;
};