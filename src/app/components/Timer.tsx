import React, { useState } from "react";

import { Button } from "@mui/material";

export const Timer: React.FC = () => {
  const startTimer = <Button>開始</Button>;
  const [buttonTimer, setButtonTimer] = useState(startTimer);
  return (
    <div>
      {buttonTimer}
      {"02:30"}
    </div>
  );
};
