import React from 'react';

interface AIInsightBannerProps {
  title: string;
  description: string;
  badgeLabel?: string;
  badgeValue?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'tertiary' | 'primary';
  icon?: string;
}

export const AIInsightBanner: React.FC<AIInsightBannerProps> = ({
  title,
  description,
  badgeLabel,
  badgeValue,
  actionText,
  onAction,
  variant = 'tertiary',
  icon = 'psychology'
}) => {
  const isPrimary = variant === 'primary';
  const containerBg = isPrimary ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container';
  const iconBg = isPrimary ? 'bg-primary text-on-primary' : 'bg-tertiary text-on-tertiary';
  const btnBg = isPrimary ? 'bg-on-primary text-primary hover:bg-surface-container-lowest' : 'bg-on-tertiary text-tertiary hover:bg-surface-container-lowest';

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-elevated ${containerBg} transition-all duration-300`}>
      {/* Ambient background blur circles */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-bl-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-lg pointer-events-none" />

      <div className="relative z-10 flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">auto_awesome</span>
            <h3 className="text-title-md font-title-md font-bold tracking-tight">{title}</h3>
          </div>

          <p className="text-body-md font-body-md leading-relaxed opacity-95 mb-3.5">
            {description}
          </p>

          {badgeLabel && badgeValue && (
            <div className="bg-surface-container-lowest/15 backdrop-blur-md rounded-xl p-3 inline-flex flex-col border border-white/10 mb-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-85">
                {badgeLabel}
              </span>
              <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold mt-0.5">
                {badgeValue}
              </span>
            </div>
          )}

          {actionText && onAction && (
            <button
              onClick={onAction}
              className={`w-full h-touch-target-min ${btnBg} rounded-xl font-label-sm font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
            >
              <span>{actionText}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
