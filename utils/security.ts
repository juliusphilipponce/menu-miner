/**
 * Security utilities for input validation, sanitization, and protection
 */

// File upload security constants
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 10;

/**
 * Validates image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Check file name length
  if (file.name.length > 255) {
    return {
      valid: false,
      error: 'File name is too long'
    };
  }

  return { valid: true };
}

/**
 * Validates multiple image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: 'No files provided' };
  }

  if (files.length > MAX_FILES) {
    return { valid: false, error: `Maximum ${MAX_FILES} files allowed` };
  }

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}

/**
 * Sanitizes text input to prevent XSS attacks
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validates API key format
 */
export function validateApiKey(apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: 'API key is required' };
  }

  const trimmedKey = apiKey.trim();

  if (trimmedKey.length < 20) {
    return { valid: false, error: 'API key is too short' };
  }

  if (trimmedKey.length > 200) {
    return { valid: false, error: 'API key is too long' };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[A-Za-z0-9_-]+$/.test(trimmedKey)) {
    return { valid: false, error: 'API key contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validates URL to prevent SSRF attacks
 */
export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Prevent localhost and private IP ranges
    const hostname = parsedUrl.hostname.toLowerCase();
    const privatePatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    if (privatePatterns.some(pattern => pattern.test(hostname))) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Rate limiting helper using simple in-memory store
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  /**
   * Clear rate limit for identifier
   */
  clear(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Export singleton instance for API requests
export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

/**
 * Escapes HTML to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return '';
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates menu item data structure
 */
export function validateMenuItem(item: any): boolean {
  if (!item || typeof item !== 'object') {
    return false;
  }

  // Check required fields
  if (typeof item.name !== 'string' || item.name.length === 0 || item.name.length > 500) {
    return false;
  }

  if (typeof item.price !== 'string' || item.price.length === 0 || item.price.length > 100) {
    return false;
  }

  if (typeof item.description !== 'string' || item.description.length > 2000) {
    return false;
  }

  // Validate image URLs if present
  if (item.imageUrls) {
    if (!Array.isArray(item.imageUrls)) {
      return false;
    }

    if (item.imageUrls.length > 50) {
      return false;
    }

    for (const url of item.imageUrls) {
      if (typeof url !== 'string' || url.length > 2048) {
        return false;
      }
      
      const validation = validateImageUrl(url);
      if (!validation.valid) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Sanitizes menu item data
 */
export function sanitizeMenuItem(item: any): any {
  return {
    name: sanitizeText(item.name || ''),
    price: sanitizeText(item.price || ''),
    description: sanitizeText(item.description || ''),
    imageUrls: Array.isArray(item.imageUrls) 
      ? item.imageUrls.filter((url: any) => typeof url === 'string').slice(0, 50)
      : []
  };
}

/**
 * Creates a secure Content Security Policy header value
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-inline/eval needed for React dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

/**
 * Generates a random nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

