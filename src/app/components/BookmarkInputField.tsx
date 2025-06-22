import React from "react";

export const BookmarkInputField: React.FC<{
  id: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, placeholder, label, value, onChange }) => {
  return (
    <label htmlFor={id} className="flex flex-col">
      <span className="text-xs font-semibold mb-1">{label}</span>
      <input
        className="min-w-[500px] max-w-none border-2 p-2 m-1 bg-gray-100 text-gray-900 text-xs"
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
};
