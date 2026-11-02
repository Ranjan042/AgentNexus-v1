import app from "./src/app.js"
import worker from "./src/worker/worker.js"

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`NotificationServer is running on port ${PORT}`);
});

