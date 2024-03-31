import { useCallback, useEffect, useState } from "react";

export default function Countdown() {
  const [countDownTime, setCountDownTIme] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const getTimeDifference = (countDownTime: any) => {
    const currentTime = new Date().getTime();
    const timeDiffrence = countDownTime - currentTime;
    let days =
      Math.floor(timeDiffrence / (24 * 60 * 60 * 1000)) >= 10
        ? Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))
        : `0${Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))}`;
    const hours =
      Math.floor((timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)) >=
        10
        ? Math.floor((timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60))
        : `0${Math.floor(
          (timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)
        )}`;
    const minutes =
      Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60)) >= 10
        ? Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60))
        : `0${Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60))}`;
    const seconds =
      Math.floor((timeDiffrence % (60 * 1000)) / 1000) >= 10
        ? Math.floor((timeDiffrence % (60 * 1000)) / 1000)
        : `0${Math.floor((timeDiffrence % (60 * 1000)) / 1000)}`;
    if (timeDiffrence < 0) {
      setCountDownTIme({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      clearInterval();
    } else {
      setCountDownTIme({
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      });
    }
  };
  const startCountDown = useCallback(() => {
    const customDate = new Date();
    const date = new Date(2024, 4 - 1, 12, 21)
    // date.setHours(date.getHours() - 7)
    setInterval(() => {
      getTimeDifference(date.getTime());
    }, 1000);
  }, []);
  useEffect(() => {
    startCountDown();
  }, [startCountDown]);

  return (
    <div className="ae-countdown-container ">
      <span className="">New drop 12/04 🌷🎀</span>
      <div className="ae-countdown-content mt-4">
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.days }}></span>
          </span>
          <span className="ae-countdown-title">ngày</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.hours }}></span>
          </span>
          <span className="ae-countdown-title">giờ</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.minutes }}></span>
          </span>
          <span className="ae-countdown-title">phút</span>
        </div>
        <div className="ae-countdown-item-container">
          <span className="ae-countdown-time">
            <span style={{ "--value": countDownTime.seconds }}></span>
          </span>
          <span className="ae-countdown-title">giây</span>
        </div>
      </div>
    </div>

  )
}