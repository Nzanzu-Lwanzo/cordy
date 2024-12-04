export type StreamType = "user" | "screen";

export interface CordyType {
  recorder: MediaRecorder | null;
  blobs: Blob[];
  stream: MediaStream | null;
  handlers?: Partial<{
    handleStop: (data?: CordyReturnDataType | undefined) => void;
    // handleStop is called if, when recording a video, its size overpasses a certain size
    // This function is not mandatory but it's very important.
    // But, when using it, it's also important to specify a timeslice on the init method

    handleCancel: () => void;
    handlePause: (e: Event) => boolean;
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

export interface DataRelatedMethodParamsType {
  filename: string;
  type: string;
}

export interface CordyReturnDataType {
  file: File;
  url: string;
  blob: Blob;
}

export interface LocalDbVideoType extends Omit<CordyReturnDataType, "url"> {
  id: number;
  date: string;
}

export interface VideoFnParams {
  successCb: (id: number) => void;
  errorCb: (e: Error) => void;
}
