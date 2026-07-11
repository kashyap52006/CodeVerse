import React from 'react';

// Placeholder - will be completed in Prompt 7
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export default function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`px-4 py-2 rounded font-semibold transition ${className}`} {...props}>
      {children}
    </button>
  );
}
