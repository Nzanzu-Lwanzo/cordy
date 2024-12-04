import { LocalDbVideoType, VideoFnParams } from "./@types";
import { listVideos } from "./elements";
import connection from "./localDb.setup";

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

export function createVideoCard({
  name,
  src,
  id,
  size,
  date,
}: {
  name: string;
  src: string | Blob;
  id: number;
  size: number;
  date: string | Date;
}) {
  const card = document.createElement("div");
  card.className = "video";
  card.id = `video-${id}`;

  let url: string;

  if (typeof src === "string") {
    url = src;
  } else {
    url = URL.createObjectURL(src);
  }

  card.innerHTML = `

  <div class="top">
    <span>
      <span class="video__name">${name}</span>
    </span>
    <span>
      <span class="date">${formatDate(date)}</span>
    </span>
  </div>

  <video src="${url}" controls="false" autoplay="false"></video>

  <div class="bottom">
    <span class="to-upload status"></span>

    <div class="buttons">
      <span class="size">${bytesToMegabytes(size)}Mo</span> 
      <button type="button" id="localdeletebtn-${id}" class="delete center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#000000"
          viewBox="0 0 256 256"
        >
          <path
            d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"
          ></path>
        </svg>
      </button>
      <button type="button" id="uploadbtn-${id}" class="upload center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#000000"
          viewBox="0 0 256 256"
        >
          <path
            d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224ZM157.66,106.34a8,8,0,0,1-11.32,11.32L136,107.31V152a8,8,0,0,1-16,0V107.31l-10.34,10.35a8,8,0,0,1-11.32-11.32l24-24a8,8,0,0,1,11.32,0Z"
          ></path>
        </svg>
      </button>
      <button type="button" class="download center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#000000"
          viewBox="0 0 256 256"
        >
          <path
            d="M248,128a87.34,87.34,0,0,1-17.6,52.81,8,8,0,1,1-12.8-9.62A71.34,71.34,0,0,0,232,128a72,72,0,0,0-144,0,8,8,0,0,1-16,0,88,88,0,0,1,3.29-23.88C74.2,104,73.1,104,72,104a48,48,0,0,0,0,96H96a8,8,0,0,1,0,16H72A64,64,0,1,1,81.29,88.68,88,88,0,0,1,248,128Zm-69.66,42.34L160,188.69V128a8,8,0,0,0-16,0v60.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
  
  `;

  return card;
}

export async function uploadVideo({
  file,
  url,
  successCb,
  errorCb,
}: {
  file: File;
  url: string;
  successCb: Function;
  errorCb: (e?: Error) => void;
}) {
  if (file) {
    const data = new FormData();

    data.append("video", file);

    try {
      const response = await fetch(url, {
        body: data,
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        successCb();
      } else {
        errorCb();
      }
    } catch (e) {
      errorCb(e as Error);
    }
  }
}

export async function displayAllLocalVideos() {
  try {
    const videos = (await connection.select({
      from: "videos",
    })) as unknown as LocalDbVideoType[];

    // With add all the videos to the screen
    videos.forEach((dbVideo) => {
      const video = createVideoCard({
        id: dbVideo.id,
        name: dbVideo.file.name,
        src: dbVideo.blob,
        date: dbVideo.date,
        size: dbVideo.file.size,
      });

      listVideos?.insertAdjacentElement("afterbegin", video);
    });
  } catch (e) {}
}

export async function displayAllCloudVideos() {}

export async function getVideoAndUpload(target: Element) {
  if (target) {
    let elementId = target.getAttribute("id");
    let videoId = elementId?.split("-")[1]!;

    // Find the video in local database first
    let video: LocalDbVideoType | undefined;
    try {
      video = (await connection.select({
        from: "videos",
        where: {
          id: parseInt(videoId),
        },
      })) as unknown as LocalDbVideoType;
    } catch {
      video = undefined;
    }

    // Upload the video to the server
    if (video) {
      uploadVideo({
        file: video.file,
        url: "http://localhost:5000/video",
        errorCb() {},
        successCb() {},
      });
    }
  }
}

export async function getVideoAndDeleteLocal(
  target: Element,
  { errorCb, successCb }: VideoFnParams
) {
  if (target) {
    let id = target.id;
    let videoId = id.split("-")[1];

    connection
      .remove({
        from: "videos",
        where: {
          id: parseInt(videoId) ?? 0,
        },
      })
      .then(() => {
        successCb(parseInt(videoId) ?? 0);
      })
      .catch((error) => {
        errorCb(error as Error);
      });
  }
}

export async function getVideoAndDeleteCloud(target: Element) {
  console.log(target);
}

export function bytesToMegabytes(bytes: number): string {
  let mo = (bytes / (1024 * 1024)).toFixed(1);
  return mo; // Convertir en mégaoctets
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);

  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();

  let hour = date.getHours();
  let minutes = date.getMinutes();
  return `${day}·${month}·${year} | ${hour}·${minutes}`;

  // Format the date using the Intl.DateTimeFormat object
}
