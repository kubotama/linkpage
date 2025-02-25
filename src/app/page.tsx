"use client";

import { BmGrid } from "./components/bmGrid";
import BmMessage from "./components/bmMessage";
import { MessageProvider } from "./contexts/MessageContext";

export const Home: React.FC = () => {
  return (
    <MessageProvider>
      <BmMessage />
      <BmGrid />
    </MessageProvider>
  );
};

export default Home;
