import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { VideoRoom } from '@/components/VideoRoom';

type AppState = 'login' | 'dashboard' | 'video-room';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [currentRoom, setCurrentRoom] = useState<string>('');

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
