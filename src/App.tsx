import { useEffect } from 'react';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';
import { StudioApplication } from '@/features/foundation';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { appLogger } from '@/core/logger';
import { AuthProvider } from '@/features/auth';

export default function App() {
  useEffect(() => {
    appLogger.info('AI Studio started', { storage: 'api' });
  }, []);

  return (
    <ThemeProvider>
      <GlobalErrorBoundary>
        <AuthProvider>
          <StudioApplication />
        </AuthProvider>
      </GlobalErrorBoundary>
    </ThemeProvider>
  );
}
