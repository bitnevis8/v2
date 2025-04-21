'use client';

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  className = "",
  disabled = false,
  onClick,
  loading,
  ...props
}) => {
  const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    danger: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus:ring-rose-500",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-2.5 text-lg",
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" role="status" aria-label="loading"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button; 