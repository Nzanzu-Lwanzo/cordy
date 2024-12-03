export type StreamType = "user" | "screen";

export interface CordyType {
  recorder: MediaRecorder | null;
  blobs: Blob[];
  stream: MediaStream | null;
  handlers?: Partial<{
    handleStop: () => void;
    handleCancel: () => void;
    handlePause: () => void;
    handleResume: () => void;
  }>;
}

export interface InitMethodParamsType {
  streamType: StreamType;
  constraints: MediaStreamConstraints;
  consumer: ((stream: CordyType["stream"]) => void) | HTMLVideoElement;
  recorderOptions?: MediaRecorderOptions;
  options?: {
    timeslice?: number;
    handleError: (e: Event) => void;
  };
}
