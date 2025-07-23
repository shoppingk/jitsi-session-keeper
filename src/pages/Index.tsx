
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { VideoRoom } from '@/components/VideoRoom';
import { TenantLoadingScreen } from '@/components/TenantLoadingScreen';

type AppState = 'login' | 'dashboard' | 'video-room';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { tenant, isLoading, error } = useTenant();
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [currentRoom, setCurrentRoom] = useState<string>('');

  // Show loading screen while tenant is being determined
  if (isLoading || error) {
    return <TenantLoadingScreen error={error} />;
  }

  // Show error if no tenant found
  if (!tenant) {
    return <TenantLoadingScreen error="No tenant configuration found" />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleJoinRoom = (roomName: string) => {
    setCurrentRoom(roomName);
    setAppState('video-room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoom('');
    setAppState('dashboard');
  };

  if (appState === 'video-room' && currentRoom) {
    return <VideoRoom roomName={currentRoom} onLeave={handleLeaveRoom} />;
  }

  return <Dashboard onJoinRoom={handleJoinRoom} />;
};

export default Index;
