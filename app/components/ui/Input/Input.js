'use client';

const Input = ({
  type = "text",
  label,
  error,
  className = "",
  required = false,
  name,
  value,
  onChange,
  ...props
}) => {
  const baseStyles = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-900 placeholder-gray-500";
  
  const classes = [
    baseStyles,
    !error ? "border-gray-300 focus:border-blue-500 focus:ring-blue-500" : "border-red-500 focus:border-red-500 focus:ring-red-500",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={classes}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 