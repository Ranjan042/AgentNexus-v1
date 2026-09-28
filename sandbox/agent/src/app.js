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

console.log("Upgraded to WebSocket Server");
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/api/terminal" });

wss.on("connection", (ws) => {
    console.log("Client connected");

    const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";

    const terminal = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: "/workspace",
        env: process.env,
    });

    console.log("Terminal spawned");

    terminal.onData((data) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    });

    ws.on("message", (data) => {
        try {
            const data = JSON.parse(MessageChannel.toString());

            if (data.type === "input") {
                terminal.write(data.data);
            }

            if (data.type === "resize") {
                terminal.resize(data.cols, data.rows);
            }


        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        terminal.kill();
    });

    terminal.onExit(() => {
        if (ws.readyState === ws.OPEN) {
            ws.close();
        }
    });


});


export default server;