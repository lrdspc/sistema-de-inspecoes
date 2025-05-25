import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonProps {
  count?: number;
  height?: number;
  width?: number | string;
  className?: string;
}

export function SkeletonLoader({
  count = 1,
  height,
  width,
  className,
}: SkeletonProps) {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      className={className}
      baseColor="#f3f4f6"
      highlightColor="#e5e7eb"
    />
  );
}
