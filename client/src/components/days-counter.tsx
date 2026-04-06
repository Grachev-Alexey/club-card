import { useState, useEffect } from 'react';

interface DaysCounterProps {
  expiryDate: string;
  status: string;
}

export default function DaysCounter({ expiryDate, status }: DaysCounterProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const expiry = new Date(expiryDate.split('.').reverse().join('-'));
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    };

    const updateDaysLeft = () => {
      const newDaysLeft = calculateDaysLeft();
      if (newDaysLeft !== daysLeft) {
        setAnimate(true);
        setTimeout(() => {
          setDaysLeft(newDaysLeft);
          setAnimate(false);
        }, 150);
      }
    };

    updateDaysLeft();
    const interval = setInterval(updateDaysLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate, daysLeft]);

  if (status === "Истекла") {
    return (
      <div className="text-center">
        <div className="text-red-400 font-bold text-lg">
          Срок истек
        </div>
        <div className="text-red-300 text-sm">
          Обратитесь для продления
        </div>
      </div>
    );
  }

  const getCounterColor = () => {
    if (daysLeft <= 7) return "text-orange-400";
    if (daysLeft <= 30) return "text-yellow-400";
    return "text-green-400";
  };

  const getCounterBg = () => {
    if (daysLeft <= 7) return "bg-orange-500/10 border-orange-500/30";
    if (daysLeft <= 30) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  return (
    <div className={`${getCounterBg()} rounded-xl p-4 border text-center transition-all-smooth`}>
      <div className={`${getCounterColor()} font-bold text-2xl ${animate ? 'animate-count-down' : ''}`}>
        {daysLeft}
      </div>
      <div className={`${getCounterColor()} text-sm`}>
        {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'} до истечения
      </div>
    </div>
  );
}