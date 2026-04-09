import React, { useState, useEffect } from 'react';
import { intervalToDuration, isBefore, type Duration } from 'date-fns';

interface CountdownProps {
  targetDate: Date;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [duration, setDuration] = useState<Duration | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (isBefore(targetDate, now)) {
        setIsExpired(true);
        setDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setDuration(intervalToDuration({ start: now, end: targetDate }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!duration) return null;

  const items = [
    { label: 'DAYS', value: duration.days || 0 },
    { label: 'HOURS', value: duration.hours || 0 },
    { label: 'MINS', value: duration.minutes || 0 },
    { label: 'SECS', value: duration.seconds || 0 },
  ];

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="glass w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-2xl border-neon-yellow/30 relative overflow-hidden group">
            <span className="text-2xl md:text-4xl font-heading text-white neon-glow-yellow relative z-10">
              {String(item.value).padStart(2, '0')}
            </span>
            <div className="absolute inset-0 bg-neon-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="text-[10px] md:text-xs font-heading text-neon-yellow mt-2 tracking-widest">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
