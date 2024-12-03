import { CordyType, InitMethodParamsType } from "./@types";

class Cordy {
  recorder: CordyType["recorder"];
  blobs: CordyType["blobs"];
  stream: CordyType["stream"];
  handlers: CordyType["handlers"];

  constructor(handlers?: CordyType["handlers"]) {
    this.recorder = null;
    this.blobs = [];
    this.stream = null;
    this.handlers = handlers;
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

      recorder.addEventListener("dataavailable", (e) => {
        this.blobs.push(e.data);
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

      recorder.start(options?.timeslice || 0);
    }
  }

  async cancel() {
    try {
      this.reset();
      return true;
    } catch (e) {
      return false;
    }
  }

  pause() {}

  resume() {}

  getData() {}

  // PRIVATE METHODS
  private handleStream(
    stream: CordyType["stream"],
    consumer: InitMethodParamsType["consumer"]
  ) {
    if (stream) {
      if (typeof consumer === "function") {
        return consumer(stream);
      } else if (consumer instanceof HTMLVideoElement) {
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
