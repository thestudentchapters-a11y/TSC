'use client';

import { ToastProvider } from '@/components/common/Toast';
import { AuthProvider } from '@/components/providers/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
