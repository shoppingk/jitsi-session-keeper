import { Recording } from '@/types/video';

class RecordingService {
  private recordings: Recording[] = [];
  private activeRecordings = new Map<string, Recording>();

  startRecording(roomId: string, roomName: string, userId: string): Recording {
    const recording: Recording = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      roomName,
      startTime: new Date(),
      isProcessing: false,
      createdBy: userId
    };

    this.recordings.push(recording);
    this.activeRecordings.set(roomId, recording);
    
    // Simulate recording start
    console.log(`Recording started for room ${roomName} (${roomId})`);
    
    return recording;
  }

  stopRecording(roomId: string): Recording | null {
    const recording = this.activeRecordings.get(roomId);
    if (!recording) return null;

    recording.endTime = new Date();
    recording.duration = recording.endTime.getTime() - recording.startTime.getTime();
    recording.isProcessing = true;

    // Simulate processing delay
    setTimeout(() => {
      recording.isProcessing = false;
      recording.fileUrl = `recordings/${recording.id}.mp4`;
      console.log(`Recording processed: ${recording.fileUrl}`);
    }, 3000);

    this.activeRecordings.delete(roomId);
    console.log(`Recording stopped for room ${roomId}`);
    
    return recording;
  }

  getRecordings(userId?: string): Recording[] {
    if (userId) {
      return this.recordings.filter(r => r.createdBy === userId);
    }
    return [...this.recordings];
  }

  isRecording(roomId: string): boolean {
    return this.activeRecordings.has(roomId);
  }

  getActiveRecording(roomId: string): Recording | null {
    return this.activeRecordings.get(roomId) || null;
  }

  downloadRecording(recordingId: string): void {
    const recording = this.recordings.find(r => r.id === recordingId);
    if (recording?.fileUrl && !recording.isProcessing) {
      // Simulate download
      const link = document.createElement('a');
      link.href = `#${recording.fileUrl}`;
      link.download = `${recording.roomName}_${recording.startTime.toISOString().split('T')[0]}.mp4`;
      link.click();
      console.log(`Downloading recording: ${recording.fileUrl}`);
    }
  }
}

export const recordingService = new RecordingService();