import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://via.placeholder.com/150', 
  fallbackText,
  referrerPolicy = 'no-referrer',
  ...props 
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackText) {
      return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 font-bold ${className}`}>
          {fallbackText}
        </div>
      );
    }
    return (
      <img 
        src={fallbackSrc} 
        alt={alt || 'Image introuvable'} 
        className={className} 
        {...props} 
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy={referrerPolicy as React.HTMLAttributeReferrerPolicy}
      {...props}
    />
  );
};

export default SafeImage;
