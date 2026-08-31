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
  subtitle = 'Government reported data (Source: data.gov.in)',
  cropName = 'Tomato (Hybrid)',
  showForecast = false
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);

  // If no data points exist at all
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card border border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-title-md font-title-md text-on-surface font-semibold">{title}</h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <span className="material-symbols-outlined text-primary bg-primary-fixed/30 p-2 rounded-full text-[20px]">
            show_chart
          </span>
        </div>
        <div className="my-6 py-6 px-4 bg-surface-container-low rounded-xl text-center border border-dashed border-outline-variant/40">
          <span className="material-symbols-outlined text-[32px] text-primary/70 mb-1">history_toggle_off</span>
          <p className="font-label-sm text-label-sm font-bold text-on-surface">Historical data is still being collected</p>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            Daily APMC observations are stored automatically at 06:00 AM IST. Synthetic historical prices are never manufactured.
          </p>
        </div>
      </div>
    );
  }

  // If only 1 observation is available and no forecast points
  if (data.length === 1 && !data[0].isForecast) {
    const single = data[0];
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card border border-outline-variant/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-title-md font-title-md text-on-surface font-semibold">{title}</h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <span className="material-symbols-outlined text-primary bg-primary-fixed/30 p-2 rounded-full text-[20px]">
            show_chart
          </span>
        </div>
        <div className="p-4 bg-primary-fixed/20 rounded-xl border border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              1 Government Observation Available
            </span>
            <p className="text-title-md font-bold text-on-surface mt-0.5">{single.date}</p>
            <p className="text-[11px] text-on-surface-variant">Source: data.gov.in AGMARKNET</p>
          </div>
          <div className="text-right">
            <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">₹{single.price.toFixed(2)}</span>
            <span className="text-label-sm font-normal text-on-surface-variant block">Modal Rate / kg</span>
          </div>
        </div>
      </div>
    );
  }

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

  const divisor = Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = paddingX + (i / divisor) * chartWidth;
    const y = height - paddingY - ((d.price - minPrice) / range) * chartHeight;
    return { x, y, ...d };
  });

  // Split historical vs forecast points
  const histPoints = points.filter(p => !p.isForecast);
  const forecastPoints = points.filter((p, i) => i >= Math.max(histPoints.length - 1, 0));

  const getPathD = (pts: typeof points) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x + 1} ${pts[0].y}`;
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
  const areaPath = histPoints.length > 0
    ? `${histPath} L ${histPoints[histPoints.length - 1]?.x || paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`
    : '';

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
          <span className="font-medium">
            {hoveredPoint.date} {hoveredPoint.isForecast ? '(AI Forecast)' : '(Govt Observation)'}
          </span>
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
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Historical line */}
          {histPath && <path d={histPath} fill="none" stroke="#0f5238" strokeWidth="2.5" strokeLinecap="round" />}

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
        {data.length > 2 && (
          <span className="font-semibold text-primary">{data[Math.floor(data.length / 2)]?.date}</span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-3 pt-2.5 border-t border-outline-variant/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0f5238]" />
          <span>Govt Observations ({histPoints.length})</span>
        </div>
        {showForecast && forecastPoints.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#2d6a4f]" />
            <span>AI 3-Day Forecast</span>
          </div>
        )}
      </div>
    </div>
  );
};
