import React from 'react';
import { cn } from '@/lib/utils';

const Heading = ({ 
  icon: Icon, 
  children, 
  className,
  size = "default", // small, default, large
  align = "left", // left, center, right
  ...props 
}) => {
  const sizeStyles = {
    small: "text-lg",
    default: "text-xl", 
    large: "text-2xl"
  };

  const alignStyles = {
    left: "justify-start",
    center: "justify-center", 
    right: "justify-end"
  };

  return (
    <div 
      className={cn(
        "flex items-center space-x-2 mb-6 font-bold font-cute-heading text-white",
        alignStyles[align],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={size === "small" ? 20 : size === "large" ? 28 : 24} />}
      <h2 className='text-white'>{children}</h2>
    </div>
  );
};

export default Heading;