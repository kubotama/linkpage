import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Button } from "@mui/material";

export const Timer: React.FC<{ durationTime: number }> = ({ durationTime }) => {
  const [buttonTimer, setButtonTimer] = useState("開始");
  const [isStarted, setIsStarted] = useState(false);

  const playBeep = () => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  // expiryTimestamp を生成するヘルパー
  const getExpiryTimestamp = (duration: number): Date => {
    return new Date(Date.now() + duration * 1000);
  };

  const { seconds, minutes, isRunning, restart, pause } = useTimer({
    expiryTimestamp: getExpiryTimestamp(durationTime),
    autoStart: false,
  });

  const handleButtonClick = () => {
    if (isRunning) {
      pause();
    } else {
      restart(getExpiryTimestamp(durationTime));
    }
    setIsStarted(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      setButtonTimer("停止");
    } else {
      setButtonTimer("開始");
      if (isStarted) {
        playBeep();
        restart(getExpiryTimestamp(durationTime));
      }
    }
  }, [durationTime, isRunning, isStarted, restart]);

  return (
    <div>
      <Button onClick={handleButtonClick} variant="contained">
        {buttonTimer}
      </Button>
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </div>
  );
};
