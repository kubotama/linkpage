import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";

import { Box, Button } from "@mui/material";

type Status = "開始" | "停止";

export const Timer: React.FC = () => {
  const [durationTime, setDurationTime] = useState<number>(180);
  const [isTimerDisabled, setIsTimerDisabled] = useState(true);
  const [status, setStatus] = useState<Status>("停止");
  const [minutesInput, setMinutesInput] = useState<string>("");
  const [secondsInput, setSecondsInput] = useState<string>("");
  const [minutesText, setMinutesText] = useState<string>("");
  const [secondsText, setSecondsText] = useState<string>("");
  const [timerMessage, setTimerMessage] =
    useState<string>("タイマーの時間をロード中...");

  useEffect(() => {
    fetch("/api/timer")
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      })
      .then((text) => {
        const timerTime = Number(text);
        setDurationTime(timerTime);
        setIsTimerDisabled(false);
        setTimerMessage("");
        setStatus("停止");
      })
      .catch((error) => {
        setIsTimerDisabled(false);
        setTimerMessage(error.message);
        setStatus("停止");
      });
  }, []);

  useEffect(() => {
    const m = Math.floor(durationTime / 60);
    const s = durationTime % 60;
    const mText = m.toString().padStart(2, "0");
    const sText = s.toString().padStart(2, "0");
    setMinutesInput(mText);
    setSecondsInput(sText);
  }, [durationTime]);

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

  useEffect(() => {
    if (isRunning) {
      const mText = minutes.toString().padStart(2, "0");
      const sText = seconds.toString().padStart(2, "0");
      setMinutesText(mText);
      setSecondsText(sText);
    } else if (status === "開始") {
      playBeep();
      restart(getExpiryTimestamp(durationTime));
    }
  }, [durationTime, isRunning, minutes, restart, seconds, status]);

  const startClick = () => {
    setTimerMessage("");
    const m = Number(minutesInput);
    const s = Number(secondsInput);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s > 59) {
      return;
    }
    const timerTime = m * 60 + s;
    if (timerTime !== durationTime) {
      // クライアントからのAPIの呼び出し例
      fetch("/api/timer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration: timerTime }),
      });
      setDurationTime(timerTime);
    }
    restart(getExpiryTimestamp(timerTime));
    setStatus("開始");
  };

  const stopClick = () => {
    pause();
    setStatus("停止");
  };

  return (
    <>
      {status === "停止" && (
        <Box display="flex" alignItems="center">
          <Button
            color="primary"
            disabled={isTimerDisabled}
            sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={startClick}
            variant="contained"
          >
            開始
          </Button>
          <input
            data-testid="timer-input-minutes"
            size={1}
            style={{ fontSize: "1.5rem", padding: "0.5rem" }}
            value={minutesInput}
            onChange={(e) => setMinutesInput(e.target.value)}
          />
          <span style={{ fontSize: "1.5rem", padding: "0.5rem" }}>:</span>
          <input
            data-testid="timer-input-seconds"
            size={1}
            style={{ fontSize: "1.5rem", padding: "0.5rem" }}
            value={secondsInput}
            onChange={(e) => setSecondsInput(e.target.value)}
          />
          <span style={{ fontSize: "1.5rem", padding: "0.5rem" }}>
            {timerMessage}
          </span>
        </Box>
      )}
      {status === "開始" && (
        <Box display="flex" alignItems="center">
          <Button
            color="primary"
            disabled={isTimerDisabled}
            sx={{ width: "6rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={stopClick}
            variant="contained"
          >
            停止
          </Button>
          <span
            data-testid="timer-text"
            style={{ fontSize: "1.5rem", padding: "0.5rem" }}
          >
            {minutesText}:{secondsText}
          </span>
        </Box>
      )}
    </>
  );
};
