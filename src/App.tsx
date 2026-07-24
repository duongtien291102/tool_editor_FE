import { useEffect } from 'react';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';
import { StudioApplication } from '@/features/foundation';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { appLogger } from '@/core/logger';

export default function App() {
  useEffect(() => {
    appLogger.info('AI Studio foundation started', { sprint: 2, mode: 'mock' });
  }, []);

  return (
    <ThemeProvider>
      <GlobalErrorBoundary>
        <StudioApplication />
      </GlobalErrorBoundary>
    </ThemeProvider>
  );
}
