import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Box, Button } from "@mui/material";

type ButtonLabel = "開始" | "停止";

export const Timer: React.FC<{ durationTime: number }> = ({ durationTime }) => {
  // 分と秒からタイマーの文字列を生成する
  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 秒からタイマーの文字列を生成する
  const formatFromSecond = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return formatTime(minutes, seconds);
  };

  const [buttonTimer, setButtonTimer] = useState<ButtonLabel>("開始");
  const [isStarted, setIsStarted] = useState(false);
  const [timerText, setTimerText] = useState(formatFromSecond(durationTime));

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
    setTimerText(formatTime(minutes, seconds));
    if (isRunning) {
      setButtonTimer("停止");
    } else {
      setButtonTimer("開始");

      if (isStarted) {
        playBeep();
        restart(getExpiryTimestamp(durationTime));
      }
    }
  }, [durationTime, isRunning, isStarted, minutes, restart, seconds]);

  return (
    <Box display="flex" alignItems="center">
      <Button
        color="primary"
        sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
        onClick={handleButtonClick}
        variant="contained"
      >
        {buttonTimer}
      </Button>
      <span
        data-testid="timer-text"
        style={{ fontSize: "1.5rem", padding: "0.5rem" }}
      >
        {timerText}
      </span>
    </Box>
  );
};
