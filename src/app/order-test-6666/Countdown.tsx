import { useCallback, useEffect, useState } from "react";

export default function Countdown() {
  const [countDownTime, setCountDownTIme] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const startCountDown = useCallback(() => {
    const customDate = new Date();
    const date = new Date(2025, 1 - 1, 9, 21)
    // date.setHours(date.getHours() - 7)
    var intervalCoundown = setInterval(() => {
      const countDownTime = date.getTime()
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
        clearInterval(intervalCoundown);
      } else {
        setCountDownTIme({
          days: days.toString(),
          hours: hours.toString(),
          minutes: minutes.toString(),
          seconds: seconds.toString(),
        });
      }
    }, 1000);
  }, []);
  
  const getTimeDifference = (countDownTime: any) => {

  };

  useEffect(() => {
    startCountDown();
  }, [startCountDown]);

  return (
    <div className="ae-countdown-container ">
        January drop: Sold out❤️‍🔥<br/>
      {/* <span className="text-md">Order now !!</span> */}
      {/* <div className="ae-countdown-content mt-4">
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
      </div> */}
    </div>

  )
}