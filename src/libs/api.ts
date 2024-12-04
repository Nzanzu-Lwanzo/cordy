import {
  CordyReturnDataType,
  CordyType,
  DataRelatedMethodParamsType,
  InitMethodParamsType,
} from "./@types";

class Cordy {
  recorder: CordyType["recorder"];
  blobs: CordyType["blobs"];
  stream: CordyType["stream"];
  handlers: CordyType["handlers"];
  feedConsumer: HTMLVideoElement | null;
  recording: boolean;
  // private recordMaxSize: number = 1024 * 1024;

  constructor(handlers?: CordyType["handlers"]) {
    this.recorder = null;
    this.blobs = [];
    this.stream = null;
    this.handlers = handlers;
    this.feedConsumer = null;
    this.recording = false;
  }

  async init({
    streamType,
    constraints,
    consumer,
    recorderOptions,
    options,
  }: InitMethodParamsType) {
    switch (streamType) {
      case "user": {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.handleStream(this.stream, consumer);
        break;
      }

      case "screen": {
        this.stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        this.handleStream(this.stream, consumer);
        break;
      }
    }

    if (this.stream) {
      const recorder = new MediaRecorder(this.stream, recorderOptions);

      recorder.addEventListener("dataavailable", async (e) => {
        this.blobs.push(e.data);

        // Keep watching so the recorded data size don't overpass this.recordMaxSize
        /*
        let blobSize = this.blobs.reduce(
          (total, chunk) => total + chunk.size,
          0
        );

        if (blobSize >= this.recordMaxSize) {
          const data = await this.stop({
            filename: "file",
            type: "webm",
          });

          this.reset();

          if (this.handlers?.handleStop) {
            this.handlers.handleStop(data);
          }

          return;
        }
        */
        // ****************************************
      });

      recorder.addEventListener("error", (e) => {
        if (options?.handleError) {
          options.handleError(e);
        }
      });

      recorder.addEventListener("stop", () => {
        this.cancel();
        if (this.handlers?.handleStop) {
          this.handlers.handleStop();
        }
      });

      let timeslice = options?.timeslice ? options?.timeslice * 1000 : 0;

      recorder.start(timeslice);
      this.recording = true;
      this.recorder = recorder;
    }
  }

  async cancel() {
    try {
      this.reset();
      return true;
    } catch (e) {
      alert((e as Error).message);
      return false;
    }
  }

  pause({ handlePause }: { handlePause?: (e: Event) => boolean }) {
    if (this.recorder) {
      const handler =
        handlePause ||
        this.handlers?.handlePause ||
        function () {
          return true;
        };

      this.recorder?.addEventListener("pause", (e) => {
        // If the user gave a feedConsumer element
        // we pause it on their behalf
        if (this.feedConsumer) {
          this.feedConsumer.pause();
        }

        // Then we do whatever processing they wanted to do
        handler(e);
      });
      this.recorder.pause();
    } else {
      throw new ReferenceError("NO_RECORDER_AVAILABLE");
    }
  }

  resume({ handleResume }: { handleResume?: (e: Event) => boolean }) {
    if (this.recorder) {
      const handler =
        handleResume ||
        this.handlers?.handleResume ||
        function () {
          return true;
        };

      this.recorder?.addEventListener("resume", (e) => {
        // If the user gave a feedConsumer element
        // we resume it on their behalf
        if (this.feedConsumer) {
          this.feedConsumer.play();
        }

        // Then we do whatever processing they wanted to do
        handler(e);
      });
      this.recorder.resume();
    } else {
      throw new ReferenceError("NO_RECORDER_AVAILABLE");
    }
  }

  async stop({ filename, type }: DataRelatedMethodParamsType) {
    const data = await this.getData({ filename, type });
    if (!(data instanceof Error)) {
      this.reset();
      return data;
    } else {
      return undefined;
    }
  }

  // PRIVATE METHODS
  private getData({
    filename,
    type,
  }: DataRelatedMethodParamsType): Promise<CordyReturnDataType | Error> {
    return new Promise((resolve, reject) => {
      try {
        const file = new File(this.blobs, filename, {
          type: type,
          lastModified: Date.now(),
        });

        const blob = new Blob(this.blobs, {
          type: type,
        });
        const url = URL.createObjectURL(blob);

        resolve({ file, url, blob });
      } catch (e) {
        reject(e);
      } finally {
        this.recording = false;
      }
    });
  }

  private handleStream(
    stream: CordyType["stream"],
    consumer: InitMethodParamsType["consumer"]
  ) {
    if (stream) {
      if (typeof consumer === "function") {
        return consumer(stream);
      } else if (consumer instanceof HTMLVideoElement) {
        // Store a reference to this consumer
        // so we can use it later on when pausing resuming the video
        this.feedConsumer = consumer;
        return (consumer.srcObject = stream);
      } else {
        throw new TypeError("INVALID_CONSUMER");
      }
    } else {
      throw new ReferenceError("NO_STREAM_TO_CONSUME");
    }
  }

  private reset() {
    this.stream?.getTracks().forEach((track) => {
      track.stop();
    });

    this.recorder?.stop();

    this.recorder = null;
    this.blobs = [];
  }
}

export default Cordy;
