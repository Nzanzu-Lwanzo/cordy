"use strict";

import {
  CordyReturnDataType,
  LocalDbVideoType,
  StreamType,
} from "./libs/@types";
import Cordy from "./libs/api";
import {
  cancelBtn,
  chooseStreamTypeContainer,
  listVideos,
  messageInFeedZone,
  pauseIcon,
  resumeIcon,
  selectUserStreamType,
  startBtn,
  toggleCameraBtn,
  togglePauseResumeBtn,
  videoZone,
} from "./libs/elements";
import connection from "./libs/localDb.setup";
import { notify } from "./libs/utils";

import { createVideo, createVideoCard } from "./libs/dom";
import { displayAllCloudVideos, displayAllLocalVideos } from "./libs/dom";
import {
  getVideoAndDeleteCloud,
  getVideoAndDeleteLocal,
  getVideoAndUpload,
} from "./libs/manageVideos";

// ************************ AS SOON AS WE LOAD THE PAGE, GET AND DISPLAY THE VIDEOS *********
displayAllLocalVideos();
displayAllCloudVideos();
// ********************************************************************************************

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

const recorder = new Cordy({
  handleStop: handleRecordingStopped,
});

startBtn?.addEventListener("click", async function () {
  if (!recorder.recording) {
    record();
  } else {
    const data = await recorder.stop({
      filename: `${Date.now()}.vid`,
      type: "webm",
    });
    handleRecordingStopped(data);
  }
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

togglePauseResumeBtn?.addEventListener("click", function () {
  if (recorder.recorder?.state === "recording") {
    recorder.pause({
      handlePause() {
        if (togglePauseResumeBtn) {
          togglePauseResumeBtn.innerHTML = resumeIcon;
          (document.getElementById("feed") as HTMLVideoElement)?.pause();
        }

        return true;
      },
    });
  } else if (recorder.recorder?.state === "paused") {
    recorder.resume({
      handleResume() {
        if (togglePauseResumeBtn) {
          togglePauseResumeBtn.innerHTML = pauseIcon;
          (document.getElementById("feed") as HTMLVideoElement)?.play();
        }

        return true;
      },
    });
  }
});

function record() {
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
      options: {
        handleError() {
          notify(messageInFeedZone!, "An error occurred !");
        },
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
}

async function handleRecordingStopped(data: CordyReturnDataType | undefined) {
  if (!data) {
    // Do something
    return;
  }

  startBtn?.classList.remove("active-ok");
  document.getElementById("feed")?.remove();

  // Store the video in local database first
  const storedVideo = (await connection.insert({
    into: "videos",
    values: [data],
    return: true,
  })) as unknown as LocalDbVideoType[];

  const videoCard = createVideoCard({
    name: data!.file.name,
    src: data!.url,
    id: storedVideo[0].id,
    date: storedVideo[0].date,
    size: data!.file.size,
    videoType: "local",
  });

  listVideos?.insertAdjacentElement("afterbegin", videoCard);
}

listVideos?.addEventListener("click", async (e) => {
  const element = e.target as HTMLElement;

  let target;

  // For uploading the video
  if (element.matches("button.upload")) {
    target = element;
  } else {
    target = element.closest("button.upload");
  }
  {
    getVideoAndUpload(target!);
  }

  // For deleting a video
  if (element.matches("button.delete")) {
    target = element;
  } else {
    target = element.closest("button.delete");
  }
  {
    let videoType = target?.getAttribute("data-videoType") as "local" | "cloud";

    // LOCAL VIDEO
    if (videoType && videoType === "local") {
      getVideoAndDeleteLocal(target!, {
        successCb(id) {
          document.getElementById(`video-${id}`)?.remove();
        },
        errorCb(e) {
          console.log(e);
        },
      });
    }
    // CLOUD VIDEO
    else if (videoType && videoType === "cloud") {
      getVideoAndDeleteCloud(target!);
    }
  }
});

toggleCameraBtn?.addEventListener("click", function () {
  try {
    recorder.toggleCamera();
  } catch (e) {}
});
