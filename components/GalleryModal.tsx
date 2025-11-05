import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import { CloseIcon } from './Icons';

interface GalleryModalProps {
  item: MenuItem;
  onClose: () => void;
}

// A new component to handle individual image loading and errors gracefully.
const GalleryImage: React.FC<{ url: string; alt: string; onClick: (url: string) => void }> = ({ url, alt, onClick }) => {
  const [isValid, setIsValid] = useState(true);

  // If an image fails to load, this component will render nothing.
  if (!isValid) {
    return null;
  }

  return (
    <div 
      className="aspect-square bg-gray-700 rounded-md overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500" 
      onClick={() => onClick(url)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(url)}
      tabIndex={0}
      role="button"
      aria-label={`View image for ${alt}`}
    >
      <img 
        src={url} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        loading="lazy"
        onError={() => setIsValid(false)}
      />
    </div>
  );
};


const GalleryModal: React.FC<GalleryModalProps> = ({ item, onClose }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage, onClose]);

  const images = item.imageUrls || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-40 animate-fade-in" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="gallery-title">
        <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <h3 id="gallery-title" className="text-xl font-bold text-indigo-300">{item.name}</h3>
            <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close gallery">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>
          
          <main className="p-4 overflow-y-auto">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((url, index) => (
                  <GalleryImage 
                    key={index}
                    url={url}
                    alt={`${item.name} image ${index + 1}`}
                    onClick={setZoomedImage}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No images found for this item.</p>
            )}
          </main>
        </div>
      </div>

      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed view" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button onClick={() => setZoomedImage(null)} className="absolute top-2 right-2 p-2 text-white hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white" aria-label="Close zoomed image">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
};

export default GalleryModal;