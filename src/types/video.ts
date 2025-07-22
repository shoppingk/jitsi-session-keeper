export interface VideoRoom {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  participants: string[];
}

export interface Recording {
  id: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileUrl?: string;
  isProcessing: boolean;
  createdBy: string;
}

export interface JitsiConfig {
  roomName: string;
  displayName: string;
  userEmail?: string;
  userAvatar?: string;
  isRecording?: boolean;
}