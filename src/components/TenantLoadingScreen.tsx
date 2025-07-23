
import { GlassCard } from '@/components/ui/glass-card';
import { Loader2 } from 'lucide-react';

interface TenantLoadingScreenProps {
  error?: string | null;
}

export const TenantLoadingScreen = ({ error }: TenantLoadingScreenProps) => {
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <GlassCard variant="premium" className="w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-destructive mb-2">Tenant Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check the URL or contact your administrator.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <GlassCard variant="premium" className="w-full max-w-md p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-video-primary" />
        <h1 className="text-xl font-semibold mb-2">Loading Portal...</h1>
        <p className="text-muted-foreground">Initializing your workspace</p>
      </GlassCard>
    </div>
  );
};
