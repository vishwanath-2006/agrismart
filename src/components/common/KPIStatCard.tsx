import React from 'react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon: string;
  subValue?: string;
  trendText?: string;
  isPositiveTrend?: boolean;
  colorScheme?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'highlight';
  onClick?: () => void;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  icon,
  subValue,
  trendText,
  isPositiveTrend = true,
  colorScheme = 'primary',
  onClick
}) => {
  const isHighlight = colorScheme === 'highlight';

  if (isHighlight) {
    return (
      <div
        onClick={onClick}
        className={`bg-primary-container p-4 rounded-2xl shadow-card flex flex-col justify-between min-h-[96px] text-on-primary-container relative overflow-hidden ${
          onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''
        }`}
      >
        <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
          <span className="material-symbols-outlined text-[80px]">{icon}</span>
        </div>
        <div className="flex items-center gap-1.5 relative z-10 text-on-primary-container/80">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
          <span className="text-label-sm font-label-sm font-medium">{label}</span>
        </div>
        <div className="text-title-md font-title-md font-bold relative z-10">{value}</div>
      </div>
    );
  }

  const valueColor =
    colorScheme === 'secondary'
      ? 'text-secondary'
      : colorScheme === 'tertiary'
      ? 'text-tertiary'
      : 'text-primary';

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest p-4 rounded-2xl shadow-card flex flex-col justify-between min-h-[96px] border border-outline-variant/20 ${
        onClick ? 'cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-label-sm font-label-sm font-medium">{label}</span>
      </div>

      <div className="flex items-baseline justify-between gap-1 mt-1">
        <div className={`text-headline-lg-mobile font-headline-lg-mobile font-bold ${valueColor}`}>
          {value}
          {subValue && <span className="text-label-sm font-normal text-on-surface-variant ml-1">{subValue}</span>}
        </div>

        {trendText && (
          <div
            className={`flex items-center text-label-sm font-medium px-1.5 py-0.5 rounded-lg ${
              isPositiveTrend
                ? 'text-tertiary bg-tertiary-fixed/30'
                : 'text-error bg-error-container/30'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] mr-0.5">
              {isPositiveTrend ? 'trending_up' : 'trending_down'}
            </span>
            {trendText}
          </div>
        )}
      </div>
    </div>
  );
};
