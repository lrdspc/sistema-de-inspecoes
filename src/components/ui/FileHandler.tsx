import React, { useCallback } from 'react';
import { useFileSystem } from '../../hooks/usePWA';

interface FileHandlerProps {
  onFilesSelected?: (files: File[]) => void;
}

export function FileHandler({ onFilesSelected }: FileHandlerProps) {
  const { supported, handleFiles } = useFileSystem();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const results = await handleFiles(e.target.files);
      onFilesSelected?.(Array.from(e.target.files));
    }
  }, [handleFiles, onFilesSelected]);

  if (!supported) return null;

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-input"
        multiple
        accept="image/*,application/pdf"
      />
      <label
        htmlFor="file-input"
        className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg 
                   hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Selecionar Arquivos
      </label>
    </div>
  );
} 