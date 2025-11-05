import React, { useState, useCallback, useEffect } from 'react';
import type { MenuItem } from './types';
import { analyzeMenuWithGemini } from './services/geminiService';
import { fetchImagesForAllItems } from './services/googleSearchService';
import FileUploadButton from './components/FileUploadButton';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import GalleryModal from './components/GalleryModal';
import LoginPage from './components/LoginPage';
import { SparklesIcon } from './components/Icons';
import {
  validateImageFile,
  sanitizeText,
  apiRateLimiter,
  validateMenuItem,
  sanitizeMenuItem
} from './utils/security';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(10);
  const [result, setResult] = useState<MenuItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Extracting menu items...');
  const [galleryItem, setGalleryItem] = useState<MenuItem | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem('authenticated');
      if (authenticated === 'true') {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    handleClear();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setResult(null);

      // Security: Validate file type and size
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        event.target.value = '';
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || !restaurantName) {
      setError("Please upload an image and enter the restaurant name.");
      return;
    }

    // Security: Rate limiting check
    const rateLimitKey = 'analyze-request';
    if (!apiRateLimiter.isAllowed(rateLimitKey)) {
      const remaining = apiRateLimiter.getRemaining(rateLimitKey);
      setError(`Rate limit exceeded. Please wait before making another request. (${remaining} requests remaining)`);
      return;
    }

    // Security: Sanitize restaurant name input
    const sanitizedRestaurantName = sanitizeText(restaurantName);
    if (!sanitizedRestaurantName || sanitizedRestaurantName.length < 2) {
      setError("Please enter a valid restaurant name (at least 2 characters).");
      return;
    }

    if (sanitizedRestaurantName.length > 200) {
      setError("Restaurant name is too long (maximum 200 characters).");
      return;
    }

    // Security: Validate number of images
    const validatedNumImages = Math.max(1, Math.min(10, numImages));

    setIsLoading(true);
    setLoadingMessage('Extracting menu items...');
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeMenuWithGemini(imageFile);

      // Security: Validate and sanitize menu items
      const validatedItems = analysisResult
        .filter(item => validateMenuItem(item))
        .map(item => sanitizeMenuItem(item));

      if (validatedItems.length === 0) {
        setError("No valid menu items were extracted. Please try a different image.");
        return;
      }

      setLoadingMessage(`Fetching ${validatedNumImages} images per item...`);
      const itemsWithImages = await fetchImagesForAllItems(validatedItems, sanitizedRestaurantName, validatedNumImages);

      // Security: Final validation of items with images
      const finalValidatedItems = itemsWithImages
        .filter(item => validateMenuItem(item))
        .map(item => sanitizeMenuItem(item));

      setResult(finalValidatedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Analysis failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, restaurantName, numImages]);
  
  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setRestaurantName('');
    setNumImages(10);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      setGalleryItem(item);
    }
  };

  const handleCloseGallery = () => {
    setGalleryItem(null);
  };

  const isAnalyzeDisabled = isLoading || !imageFile || !restaurantName.trim();

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center">
        <Spinner message="Loading..." />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <h1 className="flex-1 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                MenuMiner
              </h1>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
              Upload a menu, provide the restaurant name, and MenuMiner will extract items and find images for each dish.
            </p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-6 h-full min-h-[60vh] lg:min-h-[500px]">
              {!previewUrl ? (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-200">Upload Your Menu</h2>
                  <p className="text-gray-400">Select a clear photo of a menu to get started.</p>
                  <FileUploadButton onFileChange={handleFileChange} disabled={isLoading} />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-4 h-full">
                  <h2 className="text-2xl font-bold text-gray-200">Image Preview</h2>
                  <div className="w-full max-w-md p-2 bg-black/20 rounded-lg flex-grow flex items-center">
                    <img src={previewUrl} alt="Menu preview" className="w-full h-auto object-contain rounded-md max-h-[35vh]" />
                  </div>
                  <div className="w-full max-w-md mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-400 mb-1">
                        Restaurant Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="restaurantName"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="e.g., The French Laundry"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                        disabled={isLoading}
                        required
                      />
                    </div>
                     <div>
                      <label htmlFor="numImages" className="block text-sm font-medium text-gray-400 mb-1">
                        Images
                      </label>
                      <input
                        type="number"
                        id="numImages"
                        value={numImages}
                        onChange={(e) => setNumImages(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))}
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="w-full max-w-md flex flex-col sm:flex-row-reverse gap-3 pt-4">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzeDisabled}
                      className="w-full sm:w-auto flex-grow flex items-center justify-center px-6 py-3 text-lg font-semibold text-white transition-all duration-300 ease-in-out bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <SparklesIcon className="w-6 h-6 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Extract & Find Images'}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg flex items-center justify-center min-h-[60vh] lg:min-h-[500px]">
              {isLoading && <Spinner message={loadingMessage} />}
              {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg"><h3 className="font-bold text-lg">Error</h3><p>{error}</p></div>}
              {!isLoading && !error && result && <ResultDisplay result={result} onItemClick={handleItemClick} />}
              {!isLoading && !error && !result && (
                <div className="text-center text-gray-500">
                  <p className="text-xl">Your extracted menu will appear here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {galleryItem && <GalleryModal item={galleryItem} onClose={handleCloseGallery} />}
    </>
  );
}

export default App;