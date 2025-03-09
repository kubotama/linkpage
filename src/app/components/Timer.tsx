import React, { useState } from "react";

import { Button } from "@mui/material";

export const Timer: React.FC = () => {
  const handlerStartTimer = () => {
    setButtonTimer(stopTimer);
  };

  const handlerStopTimer = () => {
    setButtonTimer(startTimer);
  };

  const startTimer = <Button onClick={handlerStartTimer}>開始</Button>;
  const stopTimer = <Button onClick={handlerStopTimer}>停止</Button>;
  const [buttonTimer, setButtonTimer] = useState(startTimer);

  return (
    <div>
      {buttonTimer}
      {"02:30"}
    </div>
  );
};
