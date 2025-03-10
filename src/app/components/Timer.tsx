import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Button } from "@mui/material";

const DURATION_TIME = 160;
export const Timer: React.FC = () => {
  const [buttonTimer, setButtonTimer] = useState("開始");
  const [isStarted, setIsStarted] = useState(false);
  // const [durationTime] = useState(DURATION_TIME);
  // const [mm, setMm] = useState(0);
  // const [ss, setSs] = useState(0);

  //  簡易的なビープ音再生
  function playBeep() {
    // 型定義を拡張
    const AudioContext =
      // window.AudioContext || (window as any).webkitAudioContext;
      window.AudioContext;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
    // oscillator.disconnect();
  }

  // expiryTimestamp を生成するヘルパー
  const getExpiryTimestamp = (duration: number): Date => {
    return new Date(Date.now() + duration * 1000);
  };

  // const handleExpire = () => {
  //   // setMm(Math.floor(DURATION_TIME / 60));
  //   // setSs(DURATION_TIME % 60);
  //   playBeep();
  //   // start();
  //   // restart(getExpiryTimestamp(DURATION_TIME));
  // };

  const { seconds, minutes, isRunning, restart, pause } = useTimer({
    expiryTimestamp: getExpiryTimestamp(DURATION_TIME),
    autoStart: false,
    // onExpire: () => handleExpire(),
  });

  const handlerClick = () => {
    if (!isRunning) {
      setIsStarted(true);
      restart(getExpiryTimestamp(DURATION_TIME));
      // start();
    } else {
      pause();
      setIsStarted(false);
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
        // } else {
        //   setIsStarted(true);
      }
      // start();
    }
  }, [isRunning, isStarted, restart]);

  // useEffect(() => {
  //   setMm(minutes);
  //   setSs(seconds);
  // }, [minutes, seconds]);

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
