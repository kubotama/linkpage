type ActionButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  widthClass?: string; // 例: "w-28", "w-auto"
  heightClass?: string; // 例: "h-8", "h-10"
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  widthClass = "w-28", // デフォルト値
  heightClass = "h-8", // デフォルト値
}) => {
  return (
    <button
      type="button"
      className={`${widthClass} ${heightClass} bg-blue-500 text-white p-1 rounded-md text-sm`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
