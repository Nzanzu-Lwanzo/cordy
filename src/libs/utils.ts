export function createVideo() {
  const video = document.createElement("video");
  video.muted = true;
  video.autoplay = true;
  video.controls = false;
  video.id = "feed";

  return video;
}

export function notify(element: Element, message: string) {
  element.innerHTML = message;
}
