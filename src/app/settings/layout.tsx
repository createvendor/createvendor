import { ToastProvider } from '@/context/ToastContext';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
