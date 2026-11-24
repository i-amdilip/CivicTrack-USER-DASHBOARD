import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface IssueImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export const IssueImage: React.FC<IssueImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackText = 'No photo attached',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F8FAFC] border border-[#E5E7EB] text-[#64748B] select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-4 h-4 mb-1 opacity-70" strokeWidth={1.75} />
        <span className="text-[11px] px-2 text-center truncate max-w-full">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
