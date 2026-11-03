import { restoreFiles } from "./persistence/restoreFiles.js";

await restoreFiles({
    userId: process.env.USER_ID,
    sandboxId: process.env.SANDBOX_ID
});

console.log("Workspace restored successfully");