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

const WeekIndicator: React.FC<{ 
  totalWeeks: number; 
  currentWeek: number;
  onClick?: (index: number) => void;
}> = ({ totalWeeks, currentWeek, onClick }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {Array.from({ length: totalWeeks }, (_, i) => (
        <motion.button
          key={i}
          onClick={() => onClick?.(i)}
          className={`rounded-full bg-gray-600 transition-all duration-200
            ${currentWeek === i ? 'bg-purple-500' : 'hover:bg-gray-500'}`}
          initial={false}
          animate={{
            width: currentWeek === i ? '12px' : '8px',
            height: currentWeek === i ? '12px' : '8px',
            opacity: currentWeek === i ? 1 : 0.5
          }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </div>
  );
};

const WeeklySummaryPanel: React.FC<WeeklySummaryPanelProps> = ({ weeks }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  // Always include the first week and create next week if current week says shouldShowNext
  const accessibleWeeks = [...weeks];
  if (weeks.length > 0 && weeks[0].shouldShowNext) {
    const nextWeekStart = new Date(weeks[0].weekStartDate);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    accessibleWeeks.push({
      summary: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(nextWeekStart);
        date.setDate(date.getDate() + i);
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayIndex = (date.getDay() + 6) % 7;
        
        return {
          date,
          day: dayNames[dayIndex],
          spent: 0,
          remainingToday: weeks[0].summary[0].remainingToday,
          isToday: false
        };
      }),
      totalSpent: 0,
      todaysRemaining: weeks[0].summary[0].remainingToday * 7,
      weekStartDate: nextWeekStart,
      weekNumber: weeks[0].weekNumber + 1,
      hasTransactions: false,
      shouldShowNext: false
    });
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;

    if (swipe < -100 && currentWeek < accessibleWeeks.length - 1) {
      setCurrentWeek(current => current + 1);
    } else if (swipe > 100 && currentWeek > 0) {
      setCurrentWeek(current => current - 1);
    }
  };

  const handleDrag = (e: any, { offset }: PanInfo) => {
    setDragDirection(offset.x > 0 ? 'right' : 'left');
  };

  if (accessibleWeeks.length === 0) return null;

  return (
    <div className="relative">
      <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">This Week's Summary</h3>
      
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
                {accessibleWeeks[currentWeek].weekStartDate.toLocaleDateString('en-US', { 
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-sm text-purple-400 font-medium">
                Week {accessibleWeeks[currentWeek].weekNumber}
              </span>
            </div>

            {/* Days */}
            <div className="divide-y divide-gray-700/30">
              {accessibleWeeks[currentWeek].summary.map((day, index) => {
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
                    {formatCurrency(accessibleWeeks[currentWeek].totalSpent)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 mb-1">Leftover</div>
                  <div className={`text-lg font-medium ${
                    accessibleWeeks[currentWeek].todaysRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(accessibleWeeks[currentWeek].todaysRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Week Indicator Dots */}
      {accessibleWeeks.length > 1 && (
        <WeekIndicator
          totalWeeks={accessibleWeeks.length}
          currentWeek={currentWeek}
          onClick={setCurrentWeek}
        />
      )}
    </div>
  );
};

export default WeeklySummaryPanel;