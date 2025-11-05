import React from 'react';
import { UploadIcon, CameraIcon } from './Icons';

interface FileUploadButtonProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  multiple?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileChange, disabled, multiple = false }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {/* Upload from Gallery/Files */}
      <label className={`
        relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ease-in-out bg-indigo-600 rounded-lg shadow-md cursor-pointer
        hover:bg-indigo-700 hover:shadow-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500
        disabled:bg-gray-500 disabled:cursor-not-allowed
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <UploadIcon className="w-6 h-6 mr-3" />
        <span>{multiple ? 'Upload Photos' : 'Upload Photo'}</span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onFileChange}
          disabled={disabled}
        />
      </label>

      {/* Camera Capture */}
      <label className={`
        relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ease-in-out bg-purple-600 rounded-lg shadow-md cursor-pointer
        hover:bg-purple-700 hover:shadow-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-purple-500
        disabled:bg-gray-500 disabled:cursor-not-allowed
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <CameraIcon className="w-6 h-6 mr-3" />
        <span>Take Photo</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple={multiple}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileUploadButton;
