import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recordingService } from '@/services/recordingService';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Settings, 
  Circle,
  Square,
  Users,
  Clock,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/types/video';

interface VideoRoomProps {
  roomName: string;
  onLeave: () => void;
}

export const VideoRoom = ({ roomName, onLeave }: VideoRoomProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(Date.now() - sessionStartRef.current);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize Jitsi Meet
    if (jitsiContainerRef.current && !jitsiApiRef.current) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => {
        if ((window as any).JitsiMeetExternalAPI) {
          const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
            roomName: roomName,
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: user?.username,
              email: `${user?.username}@videoconf.app`
            },
            configOverwrite: {
              startWithAudioMuted: !isAudioEnabled,
              startWithVideoMuted: !isVideoEnabled,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
              disableModeratorIndicator: false,
              startScreenSharing: false,
              enableEmailInStats: false
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
              ],
              SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false
            }
          });

          jitsiApiRef.current = api;

          api.addEventListener('videoConferenceJoined', () => {
            toast({
              title: "Joined meeting",
              description: `Connected to ${roomName}`,
            });
          });

          api.addEventListener('videoConferenceLeft', () => {
            onLeave();
          });
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, user, isAudioEnabled, isVideoEnabled, onLeave, toast]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const startRecording = () => {
    if (!isAdmin) return;
    
    const recording = recordingService.startRecording(
      roomName, 
      roomName, 
      user!.id
    );
    setCurrentRecording(recording);
    
    toast({
      title: "Recording started",
      description: "Meeting is now being recorded",
    });
  };

  const stopRecording = () => {
    if (!isAdmin || !currentRecording) return;
    
    const recording = recordingService.stopRecording(roomName);
    setCurrentRecording(null);
    
    toast({
      title: "Recording stopped",
      description: "Recording will be processed shortly",
    });
  };

  const hangUp = () => {
    if (currentRecording) {
      stopRecording();
    }
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    onLeave();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <GlassCard className="mx-4 mt-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-video-primary" />
              <h1 className="text-lg font-semibold">{roomName}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDuration(sessionDuration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username} ({user?.role})
            </span>
            {user?.avatar && <span className="text-lg">{user.avatar}</span>}
          </div>
        </div>
      </GlassCard>

      {/* Video Container */}
      <div className="flex-1 m-4">
        <GlassCard variant="elevated" className="h-full relative overflow-hidden">
          <div 
            ref={jitsiContainerRef} 
            className="w-full h-full min-h-[500px] rounded-lg"
          />
          
          {currentRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-video-warning/90 text-primary-foreground px-3 py-1 rounded-full">
              <Circle className="h-4 w-4 animate-pulse fill-current" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Controls */}
      <GlassCard className="mx-4 mb-4 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "video-ghost" : "warning"}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "video-ghost" : "warning"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          {isAdmin && (
            <Button
              variant={currentRecording ? "warning" : "success"}
              size="icon"
              onClick={currentRecording ? stopRecording : startRecording}
            >
              {currentRecording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            </Button>
          )}

          <Button variant="video-ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="destructive" size="icon" onClick={hangUp}>
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};