import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { SparklesIcon } from './Icons';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setIsLoading(true);

    try {
      if (!credentialResponse.credential) {
        setError('No credential received from Google');
        setIsLoading(false);
        return;
      }

      // Decode the JWT to get user info
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      const email = decoded.email;

      // Check if we're in development mode
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // Development mode: Simple email check (no API call)
        const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL || '';

        if (!allowedEmail) {
          setError('VITE_ALLOWED_EMAIL not configured in .env.local');
          setIsLoading(false);
          return;
        }

        if (email.toLowerCase().trim() === allowedEmail.toLowerCase().trim()) {
          // Store authentication in sessionStorage
          sessionStorage.setItem('authenticated', 'true');
          sessionStorage.setItem('userEmail', email.toLowerCase().trim());
          sessionStorage.setItem('userName', decoded.name);
          sessionStorage.setItem('userPicture', decoded.picture);
          onLogin(email);
        } else {
          setError(`Your email (${email}) is not authorized. Allowed: ${allowedEmail}`);
        }
      } else {
        // Production mode: Call API to verify token
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            googleToken: credentialResponse.credential,
            name: decoded.name,
            picture: decoded.picture
          }),
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
          // Store authentication in sessionStorage
          sessionStorage.setItem('authenticated', 'true');
          sessionStorage.setItem('userEmail', email.toLowerCase().trim());
          sessionStorage.setItem('userName', decoded.name);
          sessionStorage.setItem('userPicture', decoded.picture);
          onLogin(email);
        } else {
          setError(data.error || 'Authentication failed. Your email is not authorized.');
        }
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  // Get Google Client ID from environment variable (will be set in Vercel)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg max-w-md">
          <p className="text-sm">Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <SparklesIcon className="w-12 h-12 text-indigo-400" />
              </div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-600 mb-2">
                MenuMiner
              </h1>
              <p className="text-gray-400">
                AI-Powered Menu Extraction
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-4">
                  Sign in with your Google account
                </p>

                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_black"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="300"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-gray-400">Authenticating...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Personal use only • Secure Google authentication
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">About MenuMiner</h3>
            <p className="text-xs text-gray-400">
              Upload a menu photo and MenuMiner will extract items and find images for each dish using AI.
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;

