type ActionButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export const ActionButton = ({
  onClick,
  children,
  className = "w-28 h-8",
}: ActionButtonProps): React.ReactElement => {
  return (
    <button
      type="button"
      className={`bg-blue-500 text-white p-1 rounded-md text-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
