import { type UploadVideoResponseType } from "./@types";
import { loader } from "./dom";
import { uid } from "./localDb.setup";

export async function uploadVideo({
  file,
  url,
  successCb,
  errorCb,
  element,
}: {
  file: File;
  url: string;
  successCb: (data: UploadVideoResponseType) => void;
  errorCb: (e?: Error) => void;
  element: HTMLElement | Element;
}) {
  if (file) {
    const data = new FormData();

    let user_id = await uid;

    data.append("video", file);
    data.append("folder", user_id);

    // Feedback - loader
    const prevHTML = element.innerHTML;
    element.innerHTML = loader;

    fetch(url, {
      body: data,
      method: "POST",
      mode: "cors",
      credentials: "include",

      // Do not include the Content-Type header and let the Fetch Api add them
      // otherwise you'll have this error on your backend "Multipart: Boundary not found"
      // Stackoverflow solution : https://stackoverflow.com/questions/49692745/express-using-multer-error-multipart-boundary-not-found-request-sent-by-pos
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          successCb(data);
        } else {
          errorCb();
        }
      })
      .catch((e) => {
        errorCb(e as Error);
      })
      .finally(() => {
        element.innerHTML = prevHTML;
      });
  }
}

export async function getCloudVideos({ url }: { url: string }) {
  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data as UploadVideoResponseType[];
    }
  } catch (e) {
    return [];
  }
}

export async function deleteCloudVideo({
  url,
  successCb,
  errorCb,
  element,
}: {
  url: string;
  successCb: () => void;
  errorCb: (e?: Error) => void;
  element: HTMLElement | Element;
}) {
  // Feedback - loader
  const prevHTML = element.innerHTML;
  element.innerHTML = loader;

  fetch(url, {
    method: "DELETE",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 204) {
        successCb();
      } else {
        errorCb();
      }
    })
    .catch((e) => {
      errorCb(e as Error);
    })
    .finally(() => {
      element.innerHTML = prevHTML;
    });
}
