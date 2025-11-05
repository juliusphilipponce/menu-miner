import React, { useState, useCallback, useEffect } from 'react';
import type { MenuItem } from './types';
import { analyzeMenuWithGemini } from './services/geminiService';
import { fetchImagesForAllItems } from './services/googleSearchService';
import FileUploadButton from './components/FileUploadButton';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import GalleryModal from './components/GalleryModal';
import LoginPage from './components/LoginPage';
import { SparklesIcon, CloseIcon, UploadIcon, PhotoIcon } from './components/Icons';
import {
  validateImageFile,
  sanitizeText,
  apiRateLimiter,
  validateMenuItem,
  sanitizeMenuItem,
  MAX_FILES
} from './utils/security';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(10);
  const [result, setResult] = useState<MenuItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Extracting menu items...');
  const [galleryItem, setGalleryItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

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
    const files = event.target.files;
    if (files && files.length > 0) {
      setError(null);
      setResult(null);

      const fileArray = Array.from(files);

      // Security: Check max files limit
      const totalFiles = imageFiles.length + fileArray.length;
      if (totalFiles > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} images allowed. You currently have ${imageFiles.length} image(s).`);
        event.target.value = '';
        return;
      }

      // Security: Validate each file
      const invalidFile = fileArray.find(file => {
        const validation = validateImageFile(file);
        return !validation.valid;
      });

      if (invalidFile) {
        const validation = validateImageFile(invalidFile);
        setError(validation.error || 'Invalid file');
        event.target.value = '';
        return;
      }

      // Add new files to existing ones
      const newFiles = [...imageFiles, ...fileArray];
      setImageFiles(newFiles);

      // Generate preview URLs for new files
      const newPreviewPromises = fileArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newPreviewPromises).then(newPreviews => {
        setPreviewUrls([...previewUrls, ...newPreviews]);
      });
    }
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);

    if (newFiles.length === 0) {
      setResult(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (imageFiles.length === 0 || !restaurantName) {
      setError("Please upload at least one image and enter the restaurant name.");
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
    setLoadingMessage(`Extracting menu items from ${imageFiles.length} image(s)...`);
    setError(null);
    setResult(null);

    try {
      // Analyze all images and combine results
      const allResults: MenuItem[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        setLoadingMessage(`Analyzing image ${i + 1} of ${imageFiles.length}...`);
        const analysisResult = await analyzeMenuWithGemini(imageFiles[i]);
        allResults.push(...analysisResult);
      }

      // Security: Validate and sanitize menu items
      const validatedItems = allResults
        .filter(item => validateMenuItem(item))
        .map(item => sanitizeMenuItem(item));

      if (validatedItems.length === 0) {
        setError("No valid menu items were extracted. Please try different images.");
        return;
      }

      setLoadingMessage(`Fetching ${validatedNumImages} images per item...`);
      const itemsWithImages = await fetchImagesForAllItems(validatedItems, sanitizedRestaurantName, validatedNumImages);

      // Security: Final validation of items with images
      const finalValidatedItems = itemsWithImages
        .filter(item => validateMenuItem(item))
        .map(item => sanitizeMenuItem(item));

      setResult(finalValidatedItems);
      // Automatically switch to results tab when analysis is complete
      setActiveTab('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Analysis failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFiles, restaurantName, numImages]);

  const handleClear = () => {
    setImageFiles([]);
    setPreviewUrls([]);
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

  const isAnalyzeDisabled = isLoading || imageFiles.length === 0 || !restaurantName.trim();

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
          {/* Simple Mobile-Friendly Header */}
          <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                MenuMiner
              </h1>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </header>

          {/* Tab Navigation - Mobile Responsive */}
          <div className="flex gap-1 sm:gap-2 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-300 border-b-2 ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Scanner</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-300 border-b-2 ${
                activeTab === 'results'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Results</span>
                {result && result.length > 0 && (
                  <span className="ml-1 px-1.5 sm:px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-full flex-shrink-0">
                    {result.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          <main>
            {/* Tab 1: Upload/Capture Panel */}
            {activeTab === 'upload' && (
              <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-900/60 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-700/50 flex flex-col items-center justify-center space-y-6 h-full min-h-[60vh] lg:min-h-[500px] animate-slide-up">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 rounded-3xl pointer-events-none"></div>

              {previewUrls.length === 0 ? (
                <div className="relative z-10 text-center space-y-6 max-w-md animate-scale-in">
                  {/* Icon with gradient background */}
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                    <UploadIcon className="w-12 h-12 text-purple-400" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 mb-3">
                      Upload Your Menu
                    </h2>
                    <p className="text-gray-300 text-lg mb-2">
                      Select photos of a menu or use your camera to get started
                    </p>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                      You can upload up to {MAX_FILES} images
                    </p>
                  </div>

                  <FileUploadButton onFileChange={handleFileChange} disabled={isLoading} multiple={true} />
                </div>
              ) : (
                <div className="relative z-10 w-full flex flex-col items-center space-y-6 h-full">
                  {/* Header with image count */}
                  <div className="w-full max-w-md animate-slide-down">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                        <PhotoIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100">
                          {previewUrls.length} Image{previewUrls.length > 1 ? 's' : ''}
                        </h2>
                        <p className="text-xs text-gray-400">Ready to analyze</p>
                      </div>
                    </div>
                    {previewUrls.length < MAX_FILES && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Add more images:</p>
                        <FileUploadButton onFileChange={handleFileChange} disabled={isLoading} multiple={true} />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Image Grid */}
                  <div className="w-full max-w-md overflow-y-auto max-h-[40vh] p-3 bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group image-grid-item"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="relative overflow-hidden rounded-xl border-2 border-gray-700/50 group-hover:border-indigo-500/50 transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/20">
                            <img
                              src={url}
                              alt={`Menu preview ${index + 1}`}
                              className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveImage(index)}
                              disabled={isLoading}
                              className="absolute top-2 right-2 p-2 bg-red-500/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <CloseIcon className="w-4 h-4 text-white" />
                            </button>

                            {/* Image number badge */}
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs font-semibold text-white">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Input Fields */}
                  <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
                    <div className="sm:col-span-2 relative">
                      <label htmlFor="restaurantName" className="flex items-center gap-1 text-sm font-semibold text-gray-300 mb-2">
                        Restaurant Name
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="restaurantName"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          placeholder="e.g., The French Laundry"
                          className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl shadow-sm placeholder-gray-500 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                          required
                        />
                        {restaurantName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <label htmlFor="numImages" className="block text-sm font-semibold text-gray-300 mb-2">
                        Images per Item
                      </label>
                      <input
                        type="number"
                        id="numImages"
                        value={numImages}
                        onChange={(e) => setNumImages(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl shadow-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center font-semibold"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="w-full max-w-md flex flex-col sm:flex-row-reverse gap-3 pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzeDisabled}
                      className="group relative w-full sm:w-auto flex-grow flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-[1.02] disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <SparklesIcon className="w-6 h-6 mr-2 relative z-10" />
                      <span className="relative z-10">{isLoading ? 'Analyzing...' : 'Extract & Find Images'}</span>
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Tab 2: Extracted Menu Panel */}
            {activeTab === 'results' && (
              <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg flex items-center justify-center min-h-[60vh] lg:min-h-[500px]">
                {isLoading && <Spinner message={loadingMessage} />}
                {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg"><h3 className="font-bold text-lg">Error</h3><p>{error}</p></div>}
                {!isLoading && !error && result && <ResultDisplay result={result} onItemClick={handleItemClick} />}
                {!isLoading && !error && !result && (
                  <div className="text-center text-gray-500">
                    <p className="text-xl">Your extracted menu will appear here.</p>
                    <p className="text-sm text-gray-600 mt-2">Upload and analyze menu images to see results</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      {galleryItem && <GalleryModal item={galleryItem} onClose={handleCloseGallery} />}
    </>
  );
}

export default App;