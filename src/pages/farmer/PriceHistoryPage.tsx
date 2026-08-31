import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PriceSplineChart } from '../../components/common/PriceSplineChart';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';
import { generateAiForecastPoints } from '../../services/mandiPriceService';
import { PriceHistoryPoint } from '../../types';

export const PriceHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { priceHistory, selectedProduce, selectedMarket } = useApp();
  const [timeframe, setTimeframe] = useState<'7D' | '1M' | '3M' | 'Forecast'>('Forecast');

  const cropTitle = selectedProduce?.cropName || 'Tomato (Hybrid)';
  const benchmarkMandiName = selectedMarket?.marketName || 'KR Market, Bangalore';
  
  // Strict separation: only authentic Government observations
  const realHistoricalPoints = useMemo(
    () => priceHistory.filter(p => !p.isForecast),
    [priceHistory]
  );
  
  const latestHistorical = realHistoricalPoints[realHistoricalPoints.length - 1];
  const currentBenchmarkPrice = latestHistorical ? latestHistorical.price : 31.0;

  // Filter based on selected timeframe
  const displayData: PriceHistoryPoint[] = useMemo(() => {
    if (timeframe === 'Forecast') {
      const forecastPoints = generateAiForecastPoints(currentBenchmarkPrice, latestHistorical?.date);
      return [...realHistoricalPoints, ...forecastPoints];
    }
    
    // For 7D, 1M, 3M: return ONLY real historical points without forecast or interpolation
    const sliceCount = timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : 90;
    return realHistoricalPoints.slice(-sliceCount);
  }, [realHistoricalPoints, currentBenchmarkPrice, timeframe, latestHistorical]);

  return (
    <AppLayout title="Price History & Forecast" showBack onBack={() => navigate('/farmer/market-prices')}>
      <div className="flex flex-col w-full gap-4">
        {/* Commodity Spotlight Banner */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between mt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
                Commodity Focus
              </span>
              <span className="text-[11px] font-semibold text-on-surface-variant">
                {realHistoricalPoints.length > 0
                  ? `${realHistoricalPoints.length} Govt Observation${realHistoricalPoints.length > 1 ? 's' : ''}`
                  : 'Collecting Data'}
              </span>
            </div>
            <h2 className="text-title-md font-title-md font-bold text-on-surface mt-1.5">{cropTitle}</h2>
            <p className="text-[13px] text-on-surface-variant">Mandi: {benchmarkMandiName} (data.gov.in)</p>
          </div>
          <div className="text-right">
            <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">₹{currentBenchmarkPrice.toFixed(2)}</span>
            <span className="text-label-sm font-normal text-on-surface-variant block">Latest Reported / kg</span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30">
          {(['7D', '1M', '3M', 'Forecast'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-2 rounded-xl text-label-sm font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tf === 'Forecast' ? '✨ AI Forecast' : tf}
            </button>
          ))}
        </div>

        {/* Spline Chart with Forecast */}
        <PriceSplineChart
          data={displayData}
          title={timeframe === 'Forecast' ? 'Price Movement & 3-Day Forecast' : 'Historical Price Trend'}
          subtitle={
            timeframe === 'Forecast'
              ? 'Government reported observations + AI trajectory'
              : 'Government reported data (Source: data.gov.in)'
          }
          cropName={cropTitle}
          showForecast={timeframe === 'Forecast'}
        />

        {/* AI Forecast Intelligence Banner */}
        <AIInsightBanner
          title="AI Forecast: Price Peak Ahead"
          description="Prices for Hybrid Tomatoes are forecasted to peak at ₹34.20/kg within 3-4 days due to supply shortfalls from southern mandis."
          badgeLabel="Expected Peak Rate"
          badgeValue="₹34.20/kg"
          variant="tertiary"
          icon="auto_awesome"
        />

        {/* Market Driver Cards */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Key Price Drivers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Monsoon Impact</h4>
                <p className="text-[12px] text-tertiary font-semibold">+12% Price Uplift Expected</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/30 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">local_mall</span>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Weekend Demand</h4>
                <p className="text-[12px] text-secondary font-semibold">+8% Retail Procurement</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Truck Availability</h4>
                <p className="text-[12px] text-primary font-semibold">95% High Fleet Liquidity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA to Add Produce */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/farmer/add-produce')}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>List Produce at Recommended Price (₹31/kg)</span>
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
