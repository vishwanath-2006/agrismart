import React from 'react';

interface LiveMapPreviewProps {
  origin?: string;
  destination?: string;
  progressPercent?: number;
  speedKmh?: number;
  currentLocationDesc?: string;
  isOptimizedRoute?: boolean;
}

export const LiveMapPreview: React.FC<LiveMapPreviewProps> = ({
  origin = 'Mysore Farm, Gate 2',
  destination = 'KR Market Warehouse 4B, Bangalore',
  progressPercent = 65,
  speedKmh = 48,
  currentLocationDesc = 'SH-17 near Mandya Bypass',
  isOptimizedRoute = false
}) => {
  return (
    <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-card border border-outline-variant/30 bg-[#e8ede9]">
      {/* Visual map road styling background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#d5ded7" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Map Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Green Zones (Farmlands / Parks) */}
        <path d="M 0,20 Q 80,60 140,10 T 260,80 L 300,0 L 0,0 Z" fill="#d2e3d5" opacity="0.7" />
        <path d="M 200,160 Q 280,120 400,190 L 400,220 L 150,220 Z" fill="#d2e3d5" opacity="0.6" />

        {/* Alternate Routes (Gray) */}
        <path
          d="M 40,170 Q 120,80 200,130 T 350,50"
          fill="none"
          stroke="#b0bec5"
          strokeWidth="4"
          strokeDasharray="6 4"
        />

        {/* Main Highway Route (Agri-Green) */}
        <path
          id="mainHighway"
          d="M 40,170 C 100,170 140,110 210,110 S 290,40 350,50"
          fill="none"
          stroke="#0f5238"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Origin Marker */}
        <circle cx="40" cy="170" r="7" fill="#7d562d" stroke="#ffffff" strokeWidth="2.5" />

        {/* Destination Marker */}
        <circle cx="350" cy="50" r="8" fill="#0f5238" stroke="#ffffff" strokeWidth="2.5" />

        {/* Moving Truck Coordinate (progress ~ 65%) */}
        <g transform={`translate(${40 + (350 - 40) * (progressPercent / 100)}, ${170 + (50 - 170) * (progressPercent / 100) - 8})`}>
          <circle cx="0" cy="0" r="14" fill="#2d6a4f" className="animate-ping opacity-30" />
          <circle cx="0" cy="0" r="11" fill="#0f5238" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            🚚
          </text>
        </g>
      </svg>

      {/* Floating Speed & Telemetry Pill */}
      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-outline-variant/30 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
        <span className="text-label-sm font-semibold text-primary">{speedKmh} km/h</span>
        <span className="text-[11px] text-on-surface-variant">• GPS Active</span>
      </div>

      {/* Route Badge */}
      {isOptimizedRoute && (
        <div className="absolute top-3 right-3 bg-primary text-on-primary px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          AI Optimal Path
        </div>
      )}

      {/* Bottom Location Overlay */}
      <div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between text-on-surface">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
          <span className="text-label-sm font-medium truncate">{currentLocationDesc}</span>
        </div>
        <span className="text-[12px] font-bold text-primary shrink-0 ml-2">{progressPercent}%</span>
      </div>
    </div>
  );
};
