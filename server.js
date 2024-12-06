import dotenv from "dotenv";
dotenv.config({});

import express from "express";
import multer from "multer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

// INSTANCES
const App = express();
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEOS_ROOT_FOLDER = "cordy_videos";

// CLOUDINARY SETUP
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// MIDDLEWARES
App.use(express.static(join(__dirname, "dist")));
App.use(express.json());

// UPLOAD FILE
const fileUploader = multer({ storage, preservePath: true });

// ROUTES
App.post("/video", fileUploader.single("video"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      type: "upload",
      resource_type: "video",
      allowed_formats: ["mp4", "webm", "webp", "mkv"],
      folder: `${VIDEOS_ROOT_FOLDER}/${req.body.folder}`,
    });

    res.status(201).json({
      url: result.secure_url,
      date: result.created_at,
      name: result.original_filename,
      type: result.type,
      width: result.width,
      height: result.height,
      public_id: result.public_id,
      size: result.bytes,
    });
  } catch (e) {
    res.sendStatus(500);
  }
});

App.get("/video/:id", async (req, res) => {
  try {
    let { id: folder } = req.params;

    const result = await cloudinary.api.resources(
      {
        type: "upload",
        resource_type: "video",
        prefix: `${VIDEOS_ROOT_FOLDER}/${folder}`,
        all: true,
      },
      (error, result) => {
        if (error) {
          return res.sendStatus(500);
        }

        const data = result.resources.map((video) => {
          return {
            url: video.secure_url,
            date: video.created_at,
            name: video.asset_id,
            type: video.type,
            width: video.width,
            height: video.height,
            public_id: video.public_id,
            size: video.bytes,
          };
        });

        res.json(data);
      }
    );
  } catch (e) {
    res.sendStatus(500);
  }
});

App.delete("/video/:folder_id/:public_id", async (req, res) => {
  try {
    let { folder_id, public_id } = req.params;

    let resUrl = `${VIDEOS_ROOT_FOLDER}/${folder_id}/${public_id}`;

    await cloudinary.api.delete_resources([resUrl], {
      type: "upload",
      resource_type: "video",
      prefix: `${VIDEOS_ROOT_FOLDER}/${folder_id}`,
    });

    res.sendStatus(204);
  } catch (e) {
    res.sendStatus(500);
  }
});

// SERVE THE PAGE TO THE CLIENT
App.get("*", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// LISTEN
App.listen(5000, () => {
  console.log("SERVER RUNNING");
});
