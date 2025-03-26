import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Box, Button } from "@mui/material";

type ButtonLabel = "開始" | "停止";
type Status = "ロード中" | "開始" | "停止" | "エラー";

export const Timer: React.FC = () => {
  const [durationTime, setDurationTime] = useState<number>(0);
  const [isTimerDisabled, setIsTimerDisabled] = useState(true);
  const [status, setStatus] = useState<Status>("ロード中");
  const [timerText, setTimerText] = useState(<>タイマーの時間をロード中...</>);

  // 分と秒からタイマーの文字列を生成する
  const formatTime = (m: number, s: number): React.JSX.Element => {
    const mText = m.toString().padStart(2, "0");
    const sText = s.toString().padStart(2, "0");
    return (
      <span
        data-testid="timer-text"
        style={{ fontSize: "1.5rem", padding: "0.5rem" }}
      >
        {mText}:{sText}
      </span>
    );
  };

  useEffect(() => {
    fetch("/api/timer")
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      })
      .then((text) => {
        setDurationTime(Number(text));
        setIsTimerDisabled(false);
        setStatus("停止");
      })
      .catch((error) => {
        setIsTimerDisabled(true);
        setTimerText(<>{error.message}</>);
        setStatus("エラー");
      });
  }, []);

  // 秒からタイマーの文字列を生成する
  const formatFromSecond = React.useCallback(
    (totalSeconds: number): React.JSX.Element => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return formatTime(minutes, seconds);
    },
    []
  );

  const [buttonTimer, setButtonTimer] = useState<ButtonLabel>("開始");
  const [isStarted, setIsStarted] = useState(false);
  // const [timerText, setTimerText] = useState(formatFromSecond(180));

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
    // if (isRunning) {
    if (status === "開始") {
      pause();
      setTimerText(formatFromSecond(durationTime));
      setStatus("停止");
    } else if (status === "停止") {
      restart(getExpiryTimestamp(durationTime));
      setStatus("開始");
    }
    setIsStarted(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      setButtonTimer("停止");
      setTimerText(formatTime(minutes, seconds));
    } else {
      setButtonTimer("開始");
      setIsTimerDisabled(false);
      setTimerText(formatFromSecond(durationTime));

      if (isStarted) {
        playBeep();
        restart(getExpiryTimestamp(durationTime));
      }
    }
  }, [
    durationTime,
    formatFromSecond,
    isRunning,
    isStarted,
    minutes,
    restart,
    seconds,
  ]);

  return (
    <Box display="flex" alignItems="center">
      <Button
        color="primary"
        disabled={isTimerDisabled}
        sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
        onClick={handleButtonClick}
        variant="contained"
      >
        {buttonTimer}
      </Button>
      {timerText}
    </Box>
  );
};
