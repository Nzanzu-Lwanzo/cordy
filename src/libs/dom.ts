import { type LocalDbVideoType } from "./@types";
import { formatDate, bytesToMegabytes } from "./utils";
import connection, { uid } from "./localDb.setup";
import { listVideos } from "./elements";
import { getCloudVideos } from "./fetchers";

export const loader = `
    <div class="loader-container">
      <div class="loader">
      </div>
    </div>
`;

export function createVideo() {
  const video = document.createElement("video");
  video.muted = true;
  video.autoplay = true;
  video.controls = false;
  video.id = "feed";

  return video;
}

export function createVideoCard({
  name,
  src,
  id,
  size,
  date,
  videoType,
}: {
  name: string;
  src: string | Blob;
  id: number | string;
  size: number;
  date: string | Date;
  videoType: "local" | "cloud";
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

  const toUpload = "<span class='to-upload status'></span>";
  const uploaed = "<span class='uploaded status'></span>";

  card.innerHTML = `

  <div class="top" data-videoType="${videoType}">
    <span>
      <span class="video__name">${name}</span>
    </span>
    <span>
      <span class="date">${formatDate(date)}</span>
    </span>
  </div>

  <video src="${url}" controls="false" autoplay="false"></video>

  <div class="bottom">
    ${videoType === "local" ? toUpload : uploaed}

    <div class="buttons">
      <span class="size">${bytesToMegabytes(size)}Mo</span> 
      <button type="button" id="deletebtn-${id}" class="delete center button" data-videoType="${videoType}">
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
      ${
        videoType === "local"
          ? `
        <button type="button" id="uploadbtn-${id}" class="upload center button">
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
          </button>`
          : ""
      }

      ${
        videoType === "cloud"
          ? `
        <a href="${url}" download class="download center button">
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
        </a>
        `
          : ""
      }
      
    </div>
  </div>
  
  `;

  return card;
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
        videoType: "local",
      });

      listVideos?.insertAdjacentElement("afterbegin", video);
    });
  } catch (e) {}
}

export async function displayAllCloudVideos() {
  let user_id = await uid;
  const videos = await getCloudVideos({
    url: document.location.origin.concat(`/video/${user_id}`),
  });

  // Display all cloud videos here
  videos?.forEach((video) => {
    console.log(video);
    const videoElt = createVideoCard({
      date: video.date,
      id: video.public_id,
      name: video.name,
      size: video.size,
      src: video.url,
      videoType: "cloud",
    });

    listVideos?.insertAdjacentElement("afterbegin", videoElt);
  });
}
