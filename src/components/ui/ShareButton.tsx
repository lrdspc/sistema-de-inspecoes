import React from 'react';
import { useShare } from '../../hooks/usePWA';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export function ShareButton({ title, text, url, files }: ShareButtonProps) {
  const { canShare, share } = useShare();

  const handleShare = async () => {
    try {
      await share({ title, text, url, files });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  if (!canShare) return null;

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg 
                 hover:bg-indigo-700 transition-colors duration-200"
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      Compartilhar
    </button>
  );
} 