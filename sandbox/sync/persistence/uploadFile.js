
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime-types";

import s3, { BUCKET } from "./s3Client.js";

export async function uploadFile(filePath, s3Key) {
  try {
    const stat = await fs.lstat(filePath);

    // Do not upload symlinks or non-files
    if (!stat.isFile()) return;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET,
        Key: s3Key,
        Body: createReadStream(filePath),
        ContentType:
          mime.lookup(filePath) || "application/octet-stream"
      },
      queueSize: 2,
      partSize: 5 * 1024 * 1024
    });

    await upload.done();

    console.log("S3 uploaded:", s3Key);
  } catch (error) {
    if (error.code === "ENOENT") return;

    console.error("S3 upload error:", error);
    throw error;
  }
}
