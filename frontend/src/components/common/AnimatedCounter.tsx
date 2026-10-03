import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number; // duration in ms (default 1000)
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 900,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState<string>(typeof value === 'number' ? '0' : String(value));

  useEffect(() => {
    // If value is a string with symbols like "$2.4M", "94.2%", "14.5"
    const str = String(value);
    const numericMatch = str.match(/([0-9]+(?:\.[0-9]+)?)/);

    if (!numericMatch) {
      setDisplayValue(str);
      return;
    }

    const targetNumber = parseFloat(numericMatch[1]);
    const prefix = str.slice(0, numericMatch.index);
    const suffix = str.slice((numericMatch.index || 0) + numericMatch[0].length);
    const isDecimal = numericMatch[1].includes('.');
    const decimalPlaces = isDecimal ? numericMatch[1].split('.')[1].length : 0;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNumber = targetNumber * easeOut;

      const formatted = isDecimal ? currentNumber.toFixed(decimalPlaces) : Math.round(currentNumber).toString();
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(str); // ensure exact target string at the end
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
};
