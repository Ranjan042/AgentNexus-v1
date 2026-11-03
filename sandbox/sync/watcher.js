import { initializePersistence } from "./persistence/startPersistence.js";

const persistence = await initializePersistence();

console.log("Persistence service started");

let shuttingDown = false;

async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
        await persistence.close();
        console.log("Workspace synchronized successfully");
        process.exit(0);
    } catch (error) {
        console.error("Persistence shutdown failed:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);