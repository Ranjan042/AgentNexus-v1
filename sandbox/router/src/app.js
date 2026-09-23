import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import morgan from "morgan"

const app = express();
app.use(morgan("combined"))

app.get("/health", (req, res) => {
    res.send("OK");
});

const previewProxies = {}

function getPreviewProxy(sandboxId) {
    if (!previewProxies[sandboxId]) {
        previewProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-${sandboxId}-service:5173`,
            changeOrigin: true,
            ws: false
        })
    }
    return previewProxies[sandboxId];
}


app.use(async (req, res, next) => {
    console.log("Middleware is running", req.headers);
    try {
        const host = req.headers.host?.split(":")[0];
        console.log(host);

        if (!host?.startsWith("sandbox-")) {
            return next();
        }

        const parts = host.split(".");

        if (parts.length < 3) {
            console.log("sandboxId not found");
            return next();
        }

        const sandboxId = parts[1].split("-")[1];

        if (!sandboxId) {
            console.log("sandboxId not found");
            return next();
        }

        console.log(sandboxId);
        console.log("proxying target", `http://sandbox-${sandboxId}-service:5173`);

        return getPreviewProxy(sandboxId)(req, res);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
})

export default app