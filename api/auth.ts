import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Authentication API Route
 *
 * Verifies Google OAuth tokens and checks if the email is allowed.
 * Uses Google's token verification for secure authentication.
 *
 * Environment Variables Required:
 * - ALLOWED_EMAIL: The email address allowed to access the application
 * - GOOGLE_CLIENT_ID: Google OAuth Client ID for token verification
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
    const { email, googleToken } = req.body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        authenticated: false,
        error: 'Email is required'
      });
    }

    if (!googleToken || typeof googleToken !== 'string') {
      return res.status(400).json({
        authenticated: false,
        error: 'Google token is required'
      });
    }

    // Get configuration from environment variables
    const allowedEmail = process.env.ALLOWED_EMAIL;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!allowedEmail) {
      console.error('ALLOWED_EMAIL environment variable not configured');
      return res.status(500).json({
        authenticated: false,
        error: 'Server configuration error'
      });
    }

    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID environment variable not configured');
      return res.status(500).json({
        authenticated: false,
        error: 'Server configuration error'
      });
    }

    // Verify Google token
    try {
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`;
      const verifyResponse = await fetch(verifyUrl);

      if (!verifyResponse.ok) {
        console.error('Google token verification failed');
        return res.status(401).json({
          authenticated: false,
          error: 'Invalid Google token'
        });
      }

      const tokenData = await verifyResponse.json();

      // Verify the token is for our app
      if (tokenData.aud !== googleClientId) {
        console.error('Token audience mismatch');
        return res.status(401).json({
          authenticated: false,
          error: 'Invalid token audience'
        });
      }

      // Verify the email from token matches the provided email
      if (tokenData.email.toLowerCase() !== email.toLowerCase()) {
        console.error('Email mismatch');
        return res.status(401).json({
          authenticated: false,
          error: 'Email mismatch'
        });
      }

      // Verify email is verified by Google
      if (!tokenData.email_verified) {
        return res.status(401).json({
          authenticated: false,
          error: 'Email not verified by Google'
        });
      }

    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({
        authenticated: false,
        error: 'Token verification failed'
      });
    }

    // Normalize emails for comparison (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedAllowedEmail = allowedEmail.toLowerCase().trim();

    // Check if email matches allowed email
    if (normalizedEmail === normalizedAllowedEmail) {
      return res.status(200).json({
        authenticated: true,
        message: 'Authentication successful'
      });
    } else {
      return res.status(401).json({
        authenticated: false,
        error: 'Your email is not authorized to access this application'
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      authenticated: false,
      error: 'Internal server error'
    });
  }
}

