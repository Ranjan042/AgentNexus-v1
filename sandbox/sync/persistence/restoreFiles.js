
import {
  ListObjectsV2Command,
  GetObjectCommand
} from "@aws-sdk/client-s3";

import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import s3, { BUCKET } from "./s3Client.js";

const WORKSPACE = "/workspace";

export async function restoreFiles({
  userId,
  sandboxId
}) {
  const prefix =
    `users/${userId}/sandboxes/${sandboxId}/files/`;

  let continuationToken;

  do {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    );

    for (const object of result.Contents || []) {
      const key = object.Key;

      if (!key || !key.startsWith(prefix)) continue;

      const relativePath = key.slice(prefix.length);

      const destination = path.resolve(
        WORKSPACE,
        relativePath
      );

      // Protect against path traversal
      if (
        destination !== WORKSPACE &&
        !destination.startsWith(WORKSPACE + path.sep)
      ) {
        throw new Error("Invalid S3 object path");
      }

      await fs.mkdir(path.dirname(destination), {
        recursive: true
      });

      const file = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET,
          Key: key
        })
      );

      await pipeline(
        file.Body,
        createWriteStream(destination)
      );

      console.log("Restored:", relativePath);
    }

    continuationToken = result.IsTruncated
      ? result.NextContinuationToken
      : undefined;

  } while (continuationToken);

  console.log(
    `Workspace restored for sandbox: ${sandboxId}`
  );
}
