import React from "react";

type ActionButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      className="w-28 bg-blue-500 text-white p-1 rounded-md text-sm h-8"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
