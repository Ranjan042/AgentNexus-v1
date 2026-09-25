import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import morgan from "morgan"

const app = express();
app.use(morgan("combined"))

app.get("/router/health", (req, res) => {
    res.send("My health is ok :)");
});

const previewProxies = {}
const agentProxies = {}

function getPreviewProxy(sandboxId) {
    if (!previewProxies[sandboxId]) {
        previewProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-${sandboxId}-service:5173`,
            changeOrigin: true,
            ws: false
        })
    }
    console.log("proxying target", `http://sandbox-${sandboxId}-service:5173`);
    return previewProxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-${sandboxId}-service:3000`,
            changeOrigin: true,
            ws: false
        })
    }
    console.log("proxying target", `http://sandbox-${sandboxId}-service:3000`);
    return agentProxies[sandboxId];
}


app.use(async (req, res, next) => {
    console.log("Middleware is running");
    try {
        //http://sandbox-1.preview.localhost
        //http://sandbox-1.agent.localhost
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

        const sandboxId = host?.match(
            /^sandbox-(.+)\.(?:preview|agent)\.localhost$/
        )?.[1];
        console.log("sandboxId", sandboxId);
        const kind = parts[1];

        if (!sandboxId) {
            console.log("sandboxId not found");
            return next();
        }

        if (kind === "preview") {
            console.log("proxying target", `http://sandbox-${sandboxId}-service:5173`);
            return getPreviewProxy(sandboxId)(req, res, next);
        } else if (kind === "agent") {
            console.log("proxying target", `http://sandbox-${sandboxId}-service:3000`);
            return getAgentProxy(sandboxId)(req, res, next);
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
})

export default app