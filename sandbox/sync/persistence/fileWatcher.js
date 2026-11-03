
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs/promises";

import { uploadFile } from "./uploadFile.js";
import { deleteFile } from "./deleteFile.js";

const WORKSPACE = "/workspace";

export function startFileWatcher({
  userId,
  sandboxId
}) {
  const prefix =
    `users/${userId}/sandboxes/${sandboxId}/files/`;

  const watcher = chokidar.watch(WORKSPACE, {
    persistent: true,

    ignoreInitial: true,

    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 200
    },

    ignored: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/.next/**"
    ],

    ignorePermissionErrors: true
  });

  // Debounce timers
  const timers = new Map();

  // Serialize operations for each file
  const operations = new Map();

  function getS3Key(filePath) {
    const relativePath = path.relative(
      WORKSPACE,
      filePath
    );

    const resolved = path.resolve(filePath);

    if (
      path.isAbsolute(relativePath) ||
      relativePath === ".." ||
      relativePath.startsWith(`..${path.sep}`) ||
      resolved === WORKSPACE
    ) {
      throw new Error("Invalid workspace file path");
    }

    const keyPath = relativePath
      .split(path.sep)
      .join("/");

    return `${prefix}${keyPath}`;
  }

  function enqueue(key, task) {
    const previous = operations.get(key) ||
      Promise.resolve();

    const current = previous
      .catch(() => {})
      .then(task);

    operations.set(key, current);

    current.finally(() => {
      if (operations.get(key) === current) {
        operations.delete(key);
      }
    }).catch(() => {});

    return current;
  }

  function scheduleUpload(filePath) {
    let key;

    try {
      key = getS3Key(filePath);
    } catch (error) {
      console.error(error);
      return;
    }

    clearTimeout(timers.get(key));

    const timer = setTimeout(() => {
      timers.delete(key);

      enqueue(key, async () => {
        try {
          const stat = await fs.lstat(filePath);

          // Prevent uploading symlinks
          if (!stat.isFile()) return;

          await uploadFile(filePath, key);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.error("File sync failed:", error);
          }
        }
      });
    }, 1500);

    timers.set(key, timer);
  }

  function scheduleDelete(filePath) {
    let key;

    try {
      key = getS3Key(filePath);
    } catch (error) {
      console.error(error);
      return;
    }

    clearTimeout(timers.get(key));
    timers.delete(key);

    return enqueue(key, async () => {
      // Check whether the file was recreated
      try {
        await fs.access(filePath);
        scheduleUpload(filePath);
        return;
      } catch {}

      await deleteFile(key);
    });
  }

  watcher.on("add", scheduleUpload);
  watcher.on("change", scheduleUpload);
  watcher.on("unlink", scheduleDelete);

  watcher.on("error", error => {
    console.error("Chokidar error:", error);
  });

  console.log(
    `Watching workspace for sandbox: ${sandboxId}`
  );

  return {
    watcher,

async close() {
  const pending = [];

  for (const [key, timer] of timers.entries()) {
    clearTimeout(timer);

    const filePath = path.join(
      WORKSPACE,
      key.slice(prefix.length)
    );

    pending.push(
      enqueue(key, async () => {
        try {
          const stat = await fs.lstat(filePath);

          if (stat.isFile()) {
            await uploadFile(filePath, key);
          } else {
            await deleteFile(key);
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            await deleteFile(key);
          } else {
            throw error;
          }
        }
      })
    );
  }

  timers.clear();

  await watcher.close();

  await Promise.all(pending);
  await Promise.allSettled([...operations.values()]);
}
  };
}

