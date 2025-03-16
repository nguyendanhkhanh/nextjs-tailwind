import { useCallback, useEffect, useState } from "react";

export default function Countdown(props: any) {

  const {
    avaiable
  } = props

  const [countDownTime, setCountDownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetDate = new Date(avaiable.date); // 2h sáng 18/3/2025 UTC

      const timeDiff = targetDate - now;

      if (timeDiff <= 0) {
        setCountDownTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountDownTime({
        days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDiff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeDiff / (1000 * 60)) % 60),
        seconds: Math.floor((timeDiff / 1000) % 60),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [avaiable.date]);

  const getContent = () => {
    if (!avaiable.status) {
      if (avaiable.date > new Date().toISOString()) {
        return <span>{avaiable.content}<br /></span>
      } else {
        return <span>{avaiable.reason}<br /></span>
      }
    } else {
      return <span className="text-md">Order now !!</span>
    }
  }

  return (
    <div className="ae-countdown-container ">
      {getContent()}
      {/* {avaiable.status && <span className="text-md">Order now !!</span>} */}
      {avaiable.date && avaiable.date > new Date().toISOString() && <div className="ae-countdown-content mt-4">
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.days }}></span>
          </span>
          <span className="ae-countdown-title">days</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.hours }}></span>
          </span>
          <span className="ae-countdown-title">hours</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.minutes }}></span>
          </span>
          <span className="ae-countdown-title">minutes</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.seconds }}></span>
          </span>
          <span className="ae-countdown-title">seconds</span>
        </div>
        <div>
        </div>
      </div>}
    </div>
  );
}