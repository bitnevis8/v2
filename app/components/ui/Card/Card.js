'use client';

const Card = ({ 
  children, 
  title,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footer,
  footerClassName = ""
}) => {
  return (
    <div className={`bg-white shadow rounded-none sm:rounded-lg ${className}`}>
      {title && (
        <div className={`px-0 sm:px-4 py-3 sm:py-5 border-b border-gray-200 ${headerClassName}`}>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
        </div>
      )}
      
      <div className={`px-0 sm:px-4 py-3 sm:py-5 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className={`px-0 sm:px-4 py-3 sm:py-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 