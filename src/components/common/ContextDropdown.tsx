import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  icon?: string;
}

interface ContextDropdownProps {
  categoryLabel: string;
  options: DropdownOption[];
  selectedId: string;
  onSelect: (option: DropdownOption) => void;
  subtext?: string;
  subtextIcon?: string;
  className?: string;
}

export const ContextDropdown: React.FC<ContextDropdownProps> = ({
  categoryLabel,
  options,
  selectedId,
  onSelect,
  subtext,
  subtextIcon = 'location_on',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === selectedId) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between gap-3 text-left hover:border-primary/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Main Thumbnail or Icon */}
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm border border-outline-variant/20 bg-surface-container flex items-center justify-center">
            {selectedOption?.imageUrl ? (
              <img
                src={selectedOption.imageUrl}
                alt={selectedOption.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[24px] text-primary">
                {selectedOption?.icon || 'storefront'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              {categoryLabel}
            </span>
            <div className="font-title-md font-bold text-on-surface text-[15px] truncate flex items-center gap-2">
              <span>{selectedOption?.label || 'Select'}</span>
              {selectedOption?.sublabel && (
                <span className="text-[12px] font-normal text-on-surface-variant hidden sm:inline">
                  • {selectedOption.sublabel}
                </span>
              )}
            </div>
            {subtext && (
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-primary">{subtextIcon}</span>
                <span>{subtext}</span>
              </p>
            )}
          </div>
        </div>

        {/* Single, Clean Chevron Indicator */}
        <span
          className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu Popover with Option Thumbnails */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
        >
          <div className="max-h-64 overflow-y-auto divide-y divide-outline-variant/10">
            {options.map(opt => {
              const isSelected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Small circular thumbnail */}
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-sm border border-outline-variant/20 bg-surface-container flex items-center justify-center">
                      {opt.imageUrl ? (
                        <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {opt.icon || 'storefront'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[14px] truncate block leading-tight">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-on-surface-variant block truncate mt-0.5">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextDropdown;
