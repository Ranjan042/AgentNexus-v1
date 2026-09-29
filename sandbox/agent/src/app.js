import express from "express";
import morgan from "morgan";
import http from "http";
import { WebSocketServer } from "ws";
import pty from "node-pty";
import fileRouter from "./routes/fileRoutes.js";


const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api", fileRouter);

const WORKING_DIR = "/workspace";

const httpServer = http.createServer(app);

httpServer.on("upgrade", (request) => {
    console.log("🔥 WebSocket upgrade received:", request.url);
});

const wss = new WebSocketServer({ server: httpServer, path: "/api/terminal" });

wss.on("connection", (ws) => {
    console.log("🔥 WebSocket connection established");

    const shell =
        process.platform === "win32"
            ? "powershell.exe"
            : "/bin/bash";

    const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: WORKING_DIR,
        env: process.env,
    });

    console.log("🔥 PTY started");

    // PTY → Browser
    ptyProcess.onData((data) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    });

    // Browser → PTY
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === "resize") {
                const { cols, rows } = data;

                ptyProcess.resize(
                    Number(cols),
                    Number(rows)
                );

                console.log(`PTY resized: ${cols}x${rows}`);
                return;
            }

            if (data.type === "input") {
                ptyProcess.write(data.data);
                return;
            }

            console.warn("Unknown message type:", data.type);

        } catch (err) {
            console.error("WebSocket message parsing error:", err);
        }
    });

    ws.on("close", () => {
        console.log("🔌 Terminal closed");

        try {
            ptyProcess.kill();
        } catch (err) {
            console.error("PTY kill error:", err);
        }
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);

        try {
            ptyProcess.kill();
        } catch { }
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
        console.log(
            `PTY exited: code=${exitCode}, signal=${signal}`
        );

        if (ws.readyState === ws.OPEN) {
            ws.close();
        }
    });
});


export default httpServer;