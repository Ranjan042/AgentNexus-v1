
import { restoreFiles } from "./restoreFiles.js";
import { startFileWatcher } from "./fileWatcher.js";

export async function initializePersistence() {
  const userId = process.env.USER_ID;
  const sandboxId = process.env.SANDBOX_ID;

  if (!userId || !sandboxId) {
    throw new Error("Missing sandbox identity");
  }

  // 1. Restore previous workspace
  await restoreFiles({
    userId,
    sandboxId
  });

  console.log("Workspace restoration completed");

  // 2. Start watcher only after restoration
  const persistence = startFileWatcher({
    userId,
    sandboxId
  });

  return persistence;
}
