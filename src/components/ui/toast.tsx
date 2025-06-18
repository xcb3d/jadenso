'use client';

import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 
            ${toast.variant === 'destructive' ? 'bg-red-50 border border-red-200' : 'bg-white border border-slate-200'}`}
        >
          <div className="flex-1 w-0 p-4">
            {toast.title && (
              <div className={`font-semibold ${toast.variant === 'destructive' ? 'text-red-900' : 'text-slate-900'}`}>
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className={`mt-1 text-sm ${toast.variant === 'destructive' ? 'text-red-700' : 'text-slate-500'}`}>
                {toast.description}
              </div>
            )}
          </div>
          <div className="flex border-l border-slate-200">
            <button
              onClick={() => dismiss(toast.id || '')}
              className={`w-full border border-transparent rounded-none rounded-r-lg flex items-center justify-center p-4 text-sm font-medium
                ${toast.variant === 'destructive' ? 'text-red-600 hover:text-red-800' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 