// frontend/app/reports/components/DateRangePicker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange, preset?: DatePreset) => void;
  preset?: DatePreset;
  onPresetChange?: (preset: DatePreset) => void;
}

const PRESETS: { label: string; value: DatePreset; getRange: () => DateRange }[] = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) })
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
  },
  {
    label: '7 Days',
    value: 'last7',
    getRange: () => ({ start: subDays(new Date(), 7), end: new Date() })
  },
  {
    label: '30 Days',
    value: 'last30',
    getRange: () => ({ start: subDays(new Date(), 30), end: new Date() })
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    getRange: () => ({ start: startOfMonth(new Date()), end: new Date() })
  },
  {
    label: 'Last Month',
    value: 'lastMonth',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
  },
  {
    label: 'This Year',
    value: 'thisYear',
    getRange: () => ({ start: startOfYear(new Date()), end: new Date() })
  },
  {
    label: 'All Time',
    value: 'all',
    getRange: () => ({ start: new Date(2020, 0, 1), end: new Date() })
  },
];

export default function DateRangePicker({ 
  value, 
  onChange, 
  preset = 'last30',
  onPresetChange 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DatePreset>(preset);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePresetClick = (preset: DatePreset) => {
    const presetData = PRESETS.find(p => p.value === preset);
    if (presetData) {
      const range = presetData.getRange();
      setActivePreset(preset);
      setTempRange(range);
      onChange(range, preset);
      if (onPresetChange) onPresetChange(preset);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    onChange(tempRange, 'custom');
    setActivePreset('custom');
    if (onPresetChange) onPresetChange('custom');
    setIsOpen(false);
  };

  const getActiveLabel = () => {
    if (activePreset === 'custom') {
      return `${format(value.start, 'MMM d')} - ${format(value.end, 'MMM d')}`;
    }
    const presetData = PRESETS.find(p => p.value === activePreset);
    return presetData?.label || 'Custom';
  };

  const getDateRangeSummary = () => {
    const days = Math.ceil((value.end.getTime() - value.start.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yest';
    return `${days}d`;
  };

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-body inline-flex items-center justify-between sm:justify-start gap-2 px-3 py-2.5 bg-white border border-[#DDD5C4] rounded-lg hover:border-[#C9A468] transition-all hover:shadow-sm w-full sm:w-auto min-w-[180px]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 text-[#C9A468] flex-shrink-0" />
          <span className="text-sm text-[#2A2622] truncate">
            {getActiveLabel()}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-[#8A8377] bg-[#F7F1E4] px-2 py-0.5 rounded-full">
            {getDateRangeSummary()}
          </span>
          <ChevronDownIcon className={`h-4 w-4 text-[#8A8377] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div className={`
            fixed bottom-0 left-0 right-0 z-50 lg:absolute lg:top-full lg:bottom-auto lg:left-0 lg:right-auto
            bg-white rounded-t-2xl lg:rounded-lg border border-[#DDD5C4] shadow-xl
            transition-transform duration-300 ease-out
            ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:opacity-0 lg:scale-95'}
            max-h-[85vh] lg:max-h-[90vh] overflow-hidden
            w-full lg:w-[600px]
          `}>
            <div className="lg:hidden flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-[#DDD5C4] rounded-full" />
            </div>

            <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#F7F1E4]">
              <h3 className="font-display text-base font-medium text-[#2A2622]">Select Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#8A8377] hover:text-[#2A2622] rounded-lg hover:bg-[#F7F1E4] transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#F7F1E4] overflow-y-auto max-h-[calc(85vh-80px)] lg:max-h-[90vh]">
              {/* Presets */}
              <div className="lg:w-44 p-3">
                <p className="font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider px-1 py-2 hidden lg:block">
                  Quick Select
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset.value)}
                      className={`font-body text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activePreset === preset.value
                          ? 'bg-[#16302B] text-[#F7F1E4]'
                          : 'text-[#5B564B] hover:bg-[#F7F1E4]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range */}
              <div className="flex-1 p-4">
                <p className="font-body text-xs font-medium text-[#8A8377] uppercase tracking-wider mb-3">
                  Custom Range
                </p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-body block text-xs text-[#8A8377] mb-1">Start</label>
                      <input
                        type="date"
                        value={format(tempRange.start, 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const newStart = new Date(e.target.value);
                          setTempRange({ ...tempRange, start: newStart });
                          setActivePreset('custom');
                        }}
                        className="font-body w-full border border-[#DDD5C4] rounded-lg px-3 py-1.5 text-sm text-[#2A2622] focus:border-[#C9A468] focus:outline-none focus:ring-1 focus:ring-[#C9A468]"
                      />
                    </div>
                    <div>
                      <label className="font-body block text-xs text-[#8A8377] mb-1">End</label>
                      <input
                        type="date"
                        value={format(tempRange.end, 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const newEnd = new Date(e.target.value);
                          setTempRange({ ...tempRange, end: newEnd });
                          setActivePreset('custom');
                        }}
                        className="font-body w-full border border-[#DDD5C4] rounded-lg px-3 py-1.5 text-sm text-[#2A2622] focus:border-[#C9A468] focus:outline-none focus:ring-1 focus:ring-[#C9A468]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[
                      { label: '7d', days: 7 },
                      { label: '30d', days: 30 },
                      { label: '90d', days: 90 },
                    ].map((shortcut) => (
                      <button
                        key={shortcut.days}
                        onClick={() => {
                          const now = new Date();
                          setTempRange({ start: subDays(now, shortcut.days), end: now });
                          setActivePreset('custom');
                        }}
                        className="font-body text-xs px-3 py-1 bg-[#F7F1E4] text-[#5B564B] rounded-lg hover:bg-[#DDD5C4] transition-colors flex-1"
                      >
                        Last {shortcut.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#F7F1E4] rounded-lg p-3">
                    <p className="font-body text-xs text-[#8A8377]">Selected Range</p>
                    <p className="font-body font-medium text-[#2A2622] text-sm">
                      {format(tempRange.start, 'MMM d, yyyy')} — {format(tempRange.end, 'MMM d, yyyy')}
                    </p>
                    <p className="font-body text-xs text-[#8A8377] mt-0.5">
                      {Math.ceil((tempRange.end.getTime() - tempRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="font-body flex-1 px-4 py-2 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCustom}
                      className="font-body flex-1 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}