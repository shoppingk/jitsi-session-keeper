
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Video, Users, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        toast({
          title: "Login successful",
          description: `Welcome to ${tenant?.name}!`,
        });
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tenant-specific demo accounts
  const getDemoAccounts = () => {
    if (tenant?.subdomain === 'admin') {
      return [
        { label: 'Super Admin', username: 'superadmin', password: 'super123' }
      ];
    } else if (tenant?.subdomain === 'male') {
      return [
        { label: 'Admin', username: 'admin', password: 'admin123' },
        { label: 'John', username: 'john', password: 'user123' },
        { label: 'Mike', username: 'mike', password: 'user123' }
      ];
    } else if (tenant?.subdomain === 'female') {
      return [
        { label: 'Admin', username: 'admin', password: 'admin123' },
        { label: 'Sarah', username: 'sarah', password: 'user123' },
        { label: 'Jane', username: 'jane', password: 'user123' }
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <GlassCard variant="premium" className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              {tenant?.logo ? (
                <span className="text-3xl">{tenant.logo}</span>
              ) : (
                <Video className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{tenant?.name || 'Video Conference'}</h1>
          <p className="text-muted-foreground">Sign in to join meetings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="video" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            <Lock className="h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {getDemoAccounts().length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Demo Accounts - {tenant?.name}
            </h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              {getDemoAccounts().map((account, index) => (
                <p key={index}>
                  <strong>{account.label}:</strong> {account.username} / {account.password}
                </p>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
