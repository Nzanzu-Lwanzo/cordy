import {
  chooseMainTypeContainer,
  messageInFeedZone,
  selectUserStreamType,
  startBtn,
  videoZone,
} from "./libs/elements";

// Init variables
let stream;
let streamType = selectUserStreamType.getAttribute("data-streamType");

// First, choose the stream we want to capture (user video or screenshot video)
chooseMainTypeContainer.addEventListener("change", async function (e) {
  const element = e.target;

  if (element.matches("input[name='stream']") && element.checked) {
    streamType = element.getAttribute("data-streamType");
  }
});

// Start capturing the stream

startBtn.addEventListener("click", async (e) => {
  try {
    if (!streamType) {
      throw new Error("No stream type selected !");
    }

    // Store the stream in a global variable for later reference
    stream = await getStream(streamType);

    // Mark the recording state
    startBtn.classList.add("active-ok");

    // Display the feed as the user is recording
    const videoElement = displayFeed(stream);
    videoZone.appendChild(videoElement);
  } catch (e) {
    displayError(messageInFeedZone, e.message);
  }
});

async function getStream(dataType) {
  let stream;
  switch (dataType) {
    case "screen": {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      break;
    }

    case "user": {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      break;
    }
  }

  return stream;
}

async function displayError(element, message) {
  if (element) {
    element.innerHTML = message;
  }
}

// Then display the stream in the feed
function displayFeed(stream) {
  const elt = document.createElement("video");
  elt.muted = true;
  elt.controls = true;

  if (!stream) {
    throw new Error("No video stream available !");
  }

  elt.srcObject = stream;

  return elt;
}
