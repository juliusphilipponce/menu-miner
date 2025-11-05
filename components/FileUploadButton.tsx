import React from 'react';
import { UploadIcon } from './Icons';

interface FileUploadButtonProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileChange, disabled }) => {
  return (
    <label className={`
      relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ease-in-out bg-indigo-600 rounded-lg shadow-md cursor-pointer
      hover:bg-indigo-700 hover:shadow-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500
      disabled:bg-gray-500 disabled:cursor-not-allowed
      ${disabled ? 'opacity-50' : ''}
    `}>
      <UploadIcon className="w-6 h-6 mr-3" />
      <span>Upload Menu Photo</span>
      <input
        type="file"
        accept="image/*"
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileChange}
        disabled={disabled}
      />
    </label>
  );
};

export default FileUploadButton;
