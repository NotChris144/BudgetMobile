import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DaySummary } from '../utils/budgetCalculations';
import { formatCurrency } from '../utils/formatters';

interface WeeklySummaryPanelProps {
  weeks: {
    summary: DaySummary[];
    totalSpent: number;
    todaysRemaining: number;
    weekStartDate: Date;
    weekNumber: number;
    hasTransactions: boolean;
    shouldShowNext: boolean;
  }[];
}

const WeeklySummaryPanel: React.FC<WeeklySummaryPanelProps> = ({ weeks }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    const currentWeekData = weeks[currentWeek];

    if (swipe < -100 && currentWeek < weeks.length - 1 && currentWeekData.shouldShowNext) {
      setCurrentWeek(current => current + 1);
    } else if (swipe > 100 && currentWeek > 0) {
      setCurrentWeek(current => current - 1);
    }
  };

  const handleDrag = (e: any, { offset }: PanInfo) => {
    setDragDirection(offset.x > 0 ? 'right' : 'left');
  };

  if (weeks.length === 0) return null;

  // Only show pagination dots for weeks that should be visible
  const visibleWeeks = weeks.reduce((acc, week, index) => {
    if (index === 0 || weeks[index - 1].shouldShowNext) {
      acc.push(week);
    }
    return acc;
  }, [] as typeof weeks);

  return (
    <div className="relative">
      <h3 className="text-xl font-medium text-gray-300 mb-6 text-center">This Week's Summary</h3>
      
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentWeek}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            initial={{ 
              x: dragDirection === 'left' ? 300 : -300,
              opacity: 0 
            }}
            animate={{ 
              x: 0,
              opacity: 1 
            }}
            exit={{ 
              x: dragDirection === 'left' ? -300 : 300,
              opacity: 0 
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="card bg-gray-800/40 backdrop-blur-md rounded-3xl overflow-hidden touch-pan-y"
          >
            {/* Week Header */}
            <div className="px-6 py-3 border-b border-gray-700/30 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {weeks[currentWeek].weekStartDate.toLocaleDateString('en-US', { 
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-sm text-purple-400 font-medium">
                Week {weeks[currentWeek].weekNumber}
              </span>
            </div>

            {/* Days */}
            <div className="divide-y divide-gray-700/30">
              {weeks[currentWeek].summary.map((day, index) => {
                const hasTransactions = day.spent > 0;
                
                return (
                  <div 
                    key={`${day.date}-${index}`}
                    className={`grid grid-cols-3 px-6 py-4 text-sm ${
                      day.isToday ? 'bg-purple-500/10' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-300">
                      {day.day}
                      {day.isToday && (
                        <span className="text-xs text-purple-400 ml-2">Today</span>
                      )}
                    </div>
                    <div className="text-center text-gray-300">
                      {hasTransactions ? formatCurrency(day.spent) : '-'}
                    </div>
                    <div className={`text-right ${day.remainingToday >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {hasTransactions ? (day.remainingToday >= 0 ? '+' : '') + formatCurrency(day.remainingToday) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Footer */}
            <div className="border-t border-gray-700/50 bg-gray-800/40 px-6 py-4">
              <div className="grid grid-cols-2 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Total</div>
                  <div className="text-lg font-medium text-gray-200">
                    {formatCurrency(weeks[currentWeek].totalSpent)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 mb-1">Leftover</div>
                  <div className={`text-lg font-medium ${weeks[currentWeek].todaysRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(weeks[currentWeek].todaysRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {visibleWeeks.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {visibleWeeks.map((week, index) => (
            <button
              key={`week-${week.weekNumber}`}
              onClick={() => setCurrentWeek(index)}
              className={`transition-all duration-200 rounded-full 
                ${currentWeek === index 
                  ? 'w-3 h-3 bg-purple-500' 
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
                }`}
              aria-label={`Week ${week.weekNumber}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryPanel;