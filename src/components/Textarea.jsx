import React from "react";

const TextArea = ({
  value,
  onChange,
  placeholder = "",
  label,
  readOnly = false,
  disabled = false,
  required = false,
  rows = 10,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} 
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        rows={rows}
        required={required}
        className={`
          w-full p-4 border rounded-lg 
          ${readOnly || disabled ? "bg-gray-50" : "bg-white"}
          ${readOnly || disabled ? "cursor-not-allowed" : "cursor-text"}
          ${disabled ? "opacity-70" : ""}
          ${className}
        `}
        {...props}
      />
      {required && !value.trim() && (
        <p className="text-xs text-red-500">This field is required</p>
      )}
    </div>
  );
};

export default TextArea;
