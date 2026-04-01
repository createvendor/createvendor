'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const config = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-500', text: 'text-white' },
    error: { icon: XCircle, bg: 'bg-red-500', text: 'text-white' },
    info: { icon: Info, bg: 'bg-blue-500', text: 'text-white' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500', text: 'text-white' },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    const { icon: Icon, bg, text } = config[type];

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/20 ${bg} ${text} min-w-[280px] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-semibold text-sm flex-1">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Hook for managing toast state
export function useToast() {
    const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);
    const show = (message: string, type: ToastType = 'success') => setToast({ message, type });
    const hide = () => setToast(null);
    return { toast, show, hide };
}
