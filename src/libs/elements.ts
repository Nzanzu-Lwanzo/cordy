export const pauseIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path></svg>
`;

export const resumeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48.24-94.78-64-40A8,8,0,0,0,100,88v80a8,8,0,0,0,12.24,6.78l64-40a8,8,0,0,0,0-13.56ZM116,153.57V102.43L156.91,128Z"></path></svg>`;

export const toggleCameraBtn = document.getElementById("toggle-camera");
export const startBtn = document.getElementById("start");
export const togglePauseResumeBtn = document.getElementById("pause-resume");
export const cancelBtn = document.getElementById("cancel");
export const chooseStreamTypeContainer = document.querySelector(
  ".choose-stream-type"
);
export const messageInFeedZone = document.querySelector(".video-zone .message");
export const videoZone = document.querySelector(".video-zone");

export const selectUserStreamType = document.getElementById("user-stream");

export const listVideos = document.getElementById("list__videos");
