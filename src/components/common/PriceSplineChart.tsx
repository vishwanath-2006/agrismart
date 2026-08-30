import React, { useState } from 'react';
import { PriceHistoryPoint } from '../../types';

interface PriceSplineChartProps {
  data: PriceHistoryPoint[];
  title?: string;
  subtitle?: string;
  cropName?: string;
  showForecast?: boolean;
}

export const PriceSplineChart: React.FC<PriceSplineChartProps> = ({
  data,
  title = 'Price Trend',
  subtitle = 'Last 7 days (₹/kg)',
  cropName = 'Tomato (Hybrid)',
  showForecast = false
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) - 2;
  const maxPrice = Math.max(...prices) + 2;
  const range = maxPrice - minPrice || 1;

  const width = 340;
  const height = 140;
  const paddingX = 25;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingY - ((d.price - minPrice) / range) * chartHeight;
    return { x, y, ...d };
  });

  // Split historical vs forecast points
  const histPoints = points.filter(p => !p.isForecast);
  const forecastPoints = points.filter((p, i) => i >= histPoints.length - 1);

  const getPathD = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const histPath = getPathD(histPoints);
  const forecastPath = getPathD(forecastPoints);
  const areaPath = `${histPath} L ${histPoints[histPoints.length - 1]?.x || 0} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card border border-outline-variant/20">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-title-md font-title-md text-on-surface font-semibold">{title}</h3>
          <p className="text-label-sm font-label-sm text-on-surface-variant">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary bg-primary-fixed/30 p-2 rounded-full text-[20px]">
            show_chart
          </span>
        </div>
      </div>

      {hoveredPoint && (
        <div className="mb-2 px-3 py-1.5 bg-primary-fixed/30 text-on-primary-fixed rounded-lg text-label-sm flex items-center justify-between">
          <span className="font-medium">{hoveredPoint.date}</span>
          <span className="font-bold text-primary">₹{hoveredPoint.price.toFixed(1)}/kg</span>
        </div>
      )}

      {/* SVG Chart */}
      <div className="w-full overflow-hidden flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[160px] overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f5238" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f5238" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#edeeef"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingY + chartHeight / 2}
            stroke="#edeeef"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area under historical line */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Historical line */}
          <path d={histPath} fill="none" stroke="#0f5238" strokeWidth="2.5" strokeLinecap="round" />

          {/* Forecast line (Dashed) */}
          {showForecast && forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pt.isForecast ? 4 : 5}
                fill={pt.isForecast ? '#2c6a4e' : '#0f5238'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-transform hover:scale-125"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center text-[11px] font-medium text-on-surface-variant mt-2 px-2">
        <span>{data[0]?.date}</span>
        <span className="font-semibold text-primary">{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};
