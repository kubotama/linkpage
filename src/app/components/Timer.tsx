import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Button } from "@mui/material";

const DURATION_TIME = 160;
export const Timer: React.FC = () => {
  const [buttonTimer, setButtonTimer] = useState("開始");
  const [isStarted, setIsStarted] = useState(false);

  //  簡易的なビープ音再生
  function playBeep() {
    // 型定義を拡張
    const AudioContext = window.AudioContext;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  }

  // expiryTimestamp を生成するヘルパー
  const getExpiryTimestamp = (duration: number): Date => {
    return new Date(Date.now() + duration * 1000);
  };

  const { seconds, minutes, isRunning, restart, pause } = useTimer({
    expiryTimestamp: getExpiryTimestamp(DURATION_TIME),
    autoStart: false,
  });

  const handlerClick = () => {
    if (!isRunning) {
      setIsStarted(true);
      restart(getExpiryTimestamp(DURATION_TIME));
    } else {
      setIsStarted(false);
      pause();
    }
  };

  useEffect(() => {
    if (isRunning) {
      setButtonTimer("停止");
    } else {
      setButtonTimer("開始");
      if (isStarted) {
        playBeep();
        restart(getExpiryTimestamp(DURATION_TIME));
      }
    }
  }, [isRunning, isStarted, restart]);

  return (
    <div>
      <Button onClick={handlerClick} variant="contained">
        {buttonTimer}
      </Button>
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </div>
  );
};
