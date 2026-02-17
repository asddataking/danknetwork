import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-neon-green text-black hover:bg-neon-green-dark shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50',
    secondary: 'bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green/10',
    outline: 'bg-transparent border border-gray-700 text-white hover:border-neon-green hover:text-neon-green',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
