import { LocalDbVideoType, VideoFnParams } from "./@types";
import connection from "./localDb.setup";
import { deleteCloudVideo, uploadVideo } from "./fetchers";
import { createVideoCard } from "./dom";

export async function getVideoAndUpload(target: Element) {
  if (target) {
    let elementId = target.getAttribute("id");
    let videoId = elementId?.split("-")[1]!;

    // Find the video in local database first
    let video: LocalDbVideoType[] | undefined;
    try {
      video = (await connection.select({
        from: "videos",
        where: {
          id: parseInt(videoId),
        },
      })) as unknown as LocalDbVideoType[];
    } catch {
      video = undefined;
    }

    // Upload the video to the server
    if (video) {
      uploadVideo({
        file: video[0].file,
        url: document.location.origin.concat("/video"),
        errorCb() {},
        successCb(video) {
          // Delete this video from local db
          connection
            .remove({
              from: "videos",
              where: {
                id: parseInt(videoId),
              },
            })
            .then(() => {
              // Remove the video card from the DOM
              const oldVideoElt = document.getElementById(`video-${videoId}`);

              // Create a card of the cloud video and add it to the DOM
              const cloudVideo = createVideoCard({
                date: video.date,
                id: video.public_id,
                name: video.name,
                size: 0,
                src: video.url,
                videoType: "cloud",
              });

              if (oldVideoElt) {
                oldVideoElt.replaceWith(cloudVideo);
              }
            })
            .catch((e) => {
              console.log(e);
            });
        },
        element: target,
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
  let parts = target.id.split("-")[1].split("/");
  const [main_folder, user_id, public_id] = parts;

  deleteCloudVideo({
    url: document.location.origin.concat(`/video/${user_id}/${public_id}`),
    successCb() {
      // Delete the video from the DOM
      document.getElementById(`video-${parts.join("/")}`)?.remove();
    },
    errorCb(e) {
      console.log(e);
      console.log(main_folder);
    },
    element: target,
  });
}
