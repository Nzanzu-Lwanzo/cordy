import { StreamType } from "./libs/@types";
import Cordy from "./libs/api";
import {
  cancelBtn,
  chooseStreamTypeContainer,
  messageInFeedZone,
  selectUserStreamType,
  startBtn,
  videoZone,
} from "./libs/elements";
import { createVideo, notify } from "./libs/utils";

let streamType: StreamType = selectUserStreamType?.getAttribute(
  "data-streamType"
) as StreamType;

chooseStreamTypeContainer?.addEventListener("change", function (e) {
  const element = e.target as HTMLElement | null;

  if (element && element.matches("input[name='stream'")) {
    if ((element as HTMLInputElement).checked) {
      streamType = element.getAttribute("data-streamType") as StreamType;
    }
  }
});

const recorder = new Cordy();

startBtn?.addEventListener("click", function () {
  recorder
    .init({
      streamType: streamType,
      constraints: {
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      },
      consumer: (stream) => {
        const video = createVideo();
        video.srcObject = stream;

        videoZone?.appendChild(video);
      },
    })
    .then(() => {
      startBtn?.classList.add("active-ok");
    })
    .catch((e) => {
      switch (e.message) {
        case "INVALID_CONSUMER": {
          notify(messageInFeedZone!, "The feed consumer is invalid");
          break;
        }

        case "NO_STREAM_TO_CONSUME": {
          notify(messageInFeedZone!, "No stream to consume yet");
        }
      }
    });
});

cancelBtn?.addEventListener("click", function () {
  recorder
    .cancel()
    .then(() => {
      document.getElementById("feed")?.remove();
      startBtn?.classList.remove("active-ok");
    })
    .catch(() => {});
});
