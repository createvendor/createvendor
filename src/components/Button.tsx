'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200",
        secondary: "bg-white text-indigo-600 border border-gray-100 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-100",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-none",
        outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100",
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px]",
        md: "px-6 py-3.5 text-[11px]",
        lg: "px-10 py-5 text-[13px]",
        icon: "p-3",
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    {icon && <span className={children ? "mr-3" : ""}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
