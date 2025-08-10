type BookmarkInputFieldProps = {
  id: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Tailwind CSS class to specify the minimum width.
   * @example 'min-w-[300px]'
   * @default 'min-w-bookmark-details'
   */
  className?: string;
};

export const BookmarkInputField = ({
  id,
  placeholder,
  label,
  value,
  onChange,
  className = "min-w-bookmark-details", // デフォルト値
}: BookmarkInputFieldProps): React.ReactElement => {
  return (
    <label htmlFor={id} className="flex flex-col">
      <span className="text-xs font-semibold mb-1">{label}</span>
      <input
        className={`max-w-none border-2 p-2 h-8 bg-gray-100 text-gray-900 text-xs ${className}`}
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
};
