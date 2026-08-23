import React from 'react';
import './Skeleton.css';

export function Skeleton({ className = '', width, height, borderRadius, style }) {
  return (
    <div
      className={`skeleton-base ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: borderRadius || '8px',
        ...style,
      }}
    />
  );
}

export function ModuleCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="90px" height="24px" borderRadius="6px" />
        <Skeleton width="48px" height="48px" borderRadius="50%" />
      </div>
      <Skeleton className="skeleton-title" width="75%" height="20px" />
      <Skeleton className="skeleton-text" width="50%" height="14px" />
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="80px" height="14px" />
      </div>
    </div>
  );
}

export function HeroGpaSkeleton() {
  return (
    <div className="skeleton-hero">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton width="120px" height="14px" className="mb-2" />
          <Skeleton width="160px" height="48px" borderRadius="12px" />
        </div>
        <Skeleton width="100px" height="28px" borderRadius="20px" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div>
          <Skeleton width="60px" height="12px" className="mb-1" />
          <Skeleton width="40px" height="20px" />
        </div>
        <div>
          <Skeleton width="60px" height="12px" className="mb-1" />
          <Skeleton width="40px" height="20px" />
        </div>
        <div>
          <Skeleton width="60px" height="12px" className="mb-1" />
          <Skeleton width="40px" height="20px" />
        </div>
      </div>
    </div>
  );
}

export function ScheduleSkeleton() {
  return (
    <div className="skeleton-card mb-4">
      <div className="flex items-center space-x-4">
        <Skeleton width="60px" height="44px" borderRadius="10px" />
        <div className="flex-1">
          <Skeleton width="60%" height="18px" className="mb-2" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>
    </div>
  );
}

export function DashboardWidgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="skeleton-card">
        <Skeleton width="140px" height="20px" className="mb-4" />
        <ScheduleSkeleton />
        <ScheduleSkeleton />
      </div>
      <div className="skeleton-card">
        <Skeleton width="160px" height="20px" className="mb-4" />
        <ScheduleSkeleton />
        <ScheduleSkeleton />
      </div>
    </div>
  );
}
