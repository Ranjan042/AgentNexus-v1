import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import http from "http";

const app = express();

app.use(morgan("combined"));

app.get("/router/health", (req, res) => {
    res.send("My health is ok :)");
});

const previewProxies = {};
const agentProxies = {};

function getPreviewProxy(sandboxId) {
    if (!previewProxies[sandboxId]) {
        previewProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-${sandboxId}-service:5173`,
            changeOrigin: true,
            ws: true,
        });
    }

    return previewProxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-${sandboxId}-service:3000`,
            changeOrigin: true,
            ws: true,
        });
    }

    return agentProxies[sandboxId];
}


// HTTP requests
app.use(async (req, res, next) => {
    try {
        const host = req.headers.host?.split(":")[0];

        if (!host?.startsWith("sandbox-")) {
            return next();
        }

        const match = host.match(
            /^sandbox-(.+)\.(preview|agent)\.localhost$/
        );

        if (!match) {
            return next();
        }

        const sandboxId = match[1];
        const kind = match[2];

        console.log({
            host,
            sandboxId,
            kind,
            path: req.url,
        });

        if (kind === "preview") {
            return getPreviewProxy(sandboxId)(req, res, next);
        }

        if (kind === "agent") {
            return getAgentProxy(sandboxId)(req, res, next);
        }

        return next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


const server = http.createServer(app);


// WebSocket requests
server.on("upgrade", (request, socket, head) => {

    console.log("WebSocket upgrade");

    const host = request.headers.host?.split(":")[0];

    console.log("host:", host);

    if (!host?.startsWith("sandbox-")) {
        socket.destroy();
        return;
    }

    const match = host.match(
        /^sandbox-(.+)\.(preview|agent)\.localhost$/
    );

    if (!match) {
        console.log("Invalid sandbox host");
        socket.destroy();
        return;
    }

    const sandboxId = match[1];
    const kind = match[2];

    console.log({
        sandboxId,
        kind,
        url: request.url,
    });


    if (kind === "agent") {
        const proxy = getAgentProxy(sandboxId);

        return proxy.upgrade(
            request,
            socket,
            head
        );
    }


    if (kind === "preview") {
        const proxy = getPreviewProxy(sandboxId);

        return proxy.upgrade(
            request,
            socket,
            head
        );
    }


    socket.destroy();
});




export default server;