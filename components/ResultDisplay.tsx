import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import { SparklesIcon, PhotoIcon } from './Icons';

interface ResultDisplayProps {
  result: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<{ item: MenuItem; onClick: () => void; }> = ({ item, onClick }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const firstImage = item.imageUrls && item.imageUrls[0];

  // Reset the error state if the item prop (and thus the image URL) changes.
  useEffect(() => {
    setImageFailed(false);
  }, [firstImage]);

  return (
    <li 
      className="flex items-center p-4 bg-gray-800/50 rounded-lg gap-4 transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-800 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-700/50 rounded-md flex items-center justify-center overflow-hidden">
        {firstImage && !imageFailed ? (
          <img 
            src={firstImage} 
            alt={item.name} 
            className="w-full h-full object-cover" 
            onError={() => setImageFailed(true)}
          />
        ) : (
          <PhotoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-md sm:text-lg font-bold text-indigo-300">{item.name}</h4>
          <p className="text-md sm:text-lg font-semibold text-gray-200 ml-4 flex-shrink-0">{item.price}</p>
        </div>
        <p className="mt-1 text-sm text-gray-400">{item.description}</p>
      </div>
    </li>
  );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onItemClick }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="flex items-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4 flex-shrink-0">
        <SparklesIcon className="w-7 h-7 mr-2" />
        Extracted Menu
      </h2>
      
      {result.length > 0 ? (
        <ul className="space-y-4 overflow-y-auto pr-2">
            {result.map((item, index) => (
              <MenuItemCard key={`${item.name}-${index}`} item={item} onClick={() => onItemClick(item)} />
            ))}
        </ul>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
            <p>No menu items were extracted. <br />Try a different image.</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;