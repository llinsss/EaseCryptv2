import { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialTime: number; // seconds
  onExpired?: () => void;
  className?: string;
}

export function CountdownTimer({ initialTime, onExpired, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpired]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 120; // Last 2 minutes

  return (
    <div className={`countdown-text ${className}`} data-testid="countdown-timer">
      <span
        className={`text-2xl font-bold ${
          isExpired
            ? "text-destructive"
            : isUrgent
            ? "text-warning animate-pulse"
            : "text-current"
        }`}
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
