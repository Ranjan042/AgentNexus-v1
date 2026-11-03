
import {
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

import s3, { BUCKET } from "./s3Client.js";

export async function deleteFile(s3Key) {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: s3Key
      })
    );

    console.log("S3 deleted:", s3Key);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw error;
  }
}
