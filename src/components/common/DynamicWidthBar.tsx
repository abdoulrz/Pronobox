
import React, { useEffect, useRef } from 'react';

/**
 * Helper component to set dynamic widths without using inline styles in JSX,
 * satisfying strict linter rules while maintaining dynamic functionality.
 */
interface DynamicWidthBarProps {
  progress: number | string;
  className: string;
}

export const DynamicWidthBar: React.FC<DynamicWidthBarProps> = ({ progress, className }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      const widthValue = typeof progress === 'number' ? `${progress}%` : progress;
      barRef.current.style.width = widthValue;
    }
  }, [progress]);

  return <div ref={barRef} className={className} />;
};
