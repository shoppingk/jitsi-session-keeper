import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recordingService } from '@/services/recordingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { 
  Video, 
  Plus, 
  LogOut, 
  User, 
  Clock, 
  Download, 
  Play,
  Users,
  Calendar,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/types/video';

interface DashboardProps {
  onJoinRoom: (roomName: string) => void;
}

export const Dashboard = ({ onJoinRoom }: DashboardProps) => {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const [roomName, setRoomName] = useState('');
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const loadRecordings = () => {
      const allRecordings = isAdmin 
        ? recordingService.getRecordings()
        : recordingService.getRecordings(user?.id);
      setRecordings(allRecordings);
    };

    loadRecordings();
    const interval = setInterval(loadRecordings, 2000);
    return () => clearInterval(interval);
  }, [isAdmin, user?.id]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onJoinRoom(roomName.trim());
    }
  };

  const handleQuickJoin = (name: string) => {
    onJoinRoom(name);
  };

  const handleDownload = (recording: Recording) => {
    recordingService.downloadRecording(recording.id);
    toast({
      title: "Download started",
      description: `Downloading ${recording.roomName} recording`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const quickRooms = [
    'Daily Standup',
    'Team Meeting',
    'Client Call',
    'Project Review'
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-full">
                <Video className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Video Conference</h1>
                <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="capitalize">{user?.role}</span>
                {user?.avatar && <span className="text-lg">{user.avatar}</span>}
              </div>
              <Button variant="video-outline" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Join Room */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-video-primary" />
                Join a Meeting
              </h2>
              
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter room name or meeting ID"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <Button type="submit" variant="video" size="lg" className="w-full">
                  <Video className="h-4 w-4" />
                  Join Meeting
                </Button>
              </form>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Quick Join</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickRooms.map((room) => (
                    <Button
                      key={room}
                      variant="video-outline"
                      size="sm"
                      onClick={() => handleQuickJoin(room)}
                    >
                      {room}
                    </Button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Recordings */}
            <GlassCard variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-video-primary" />
                Recordings {isAdmin && <span className="text-sm text-muted-foreground">(Admin View)</span>}
              </h2>
              
              {recordings.length > 0 ? (
                <div className="space-y-3">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{recording.roomName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(recording.startTime)}
                          </span>
                          {recording.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(recording.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {recording.isProcessing ? (
                          <span className="text-sm text-video-warning">Processing...</span>
                        ) : recording.fileUrl ? (
                          <>
                            <Button size="sm" variant="video-ghost">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="video-outline"
                              onClick={() => handleDownload(recording)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Preparing...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recordings yet</p>
                  <p className="text-sm">
                    {isAdmin ? "Start a meeting and begin recording" : "Recordings will appear here"}
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <GlassCard variant="elevated" className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-video-primary" />
                Account Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recordings</span>
                  <span className="font-medium">{recordings.length}</span>
                </div>
              </div>
            </GlassCard>

            {isAdmin && (
              <GlassCard variant="elevated" className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-video-primary" />
                  Admin Features
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-video-success">
                    <div className="w-2 h-2 rounded-full bg-video-success"></div>
                    Meeting recording
                  </div>
                  <div className="flex items-center gap-2 text-video-success">
                    <div className="w-2 h-2 rounded-full bg-video-success"></div>
                    All recordings access
                  </div>
                  <div className="flex items-center gap-2 text-video-success">
                    <div className="w-2 h-2 rounded-full bg-video-success"></div>
                    Meeting management
                  </div>
                </div>
              </GlassCard>
            )}

            <GlassCard variant="elevated" className="p-6">
              <h3 className="font-semibold mb-4">Meeting Tips</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Use clear room names for easy identification</p>
                <p>• Test your camera and microphone before joining</p>
                {isAdmin && <p>• Start recording at the beginning of important meetings</p>}
                <p>• Mute your microphone when not speaking</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};