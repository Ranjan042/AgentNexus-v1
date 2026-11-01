
import { createClient } from "redis";
import { deletePods } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const subscriber = createClient({
    url: process.env.REDIS_URL
});

subscriber.on("error", (err) => {
    console.error("Redis Subscriber Error:", err);
});

export const startExpirationListener = async () => {
    try {
        await subscriber.connect();

        console.log("Redis expiration subscriber connected");

        await subscriber.subscribe(
            "__keyevent@0__:expired",
            async (key) => {
                try {
                    console.log("Expired Redis key:", key);

                    const prefix = "sandbox:active:";

                    if (!key.startsWith(prefix)) return;

                    const sandboxId = key.slice(prefix.length);

                    console.log("Deleting sandbox:", sandboxId);

                    await deletePods(sandboxId);
                    await deleteService(sandboxId);

                    console.log("Sandbox cleanup completed:", sandboxId);

                } catch (error) {
                    console.error("Sandbox cleanup error:", error);
                }
            }
        );

        console.log("Redis expiration listener started");

    } catch (error) {
        console.error("Failed to start expiration listener:", error);
        throw error;
    }
};
