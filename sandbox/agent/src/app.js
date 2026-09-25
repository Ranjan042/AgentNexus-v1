import express from "express";
import morgan from "morgan";
import path from "path";
import fs from "fs";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const WORKING_DIR = "/workspace";

app.get("/", (req, res) => {
    res.send("Agent is running! :)");
});

app.get("/health", (req, res) => {
    res.send("Don't worry, I'm healthy Agent :)");
});

app.get("/listfiles", async (req, res) => {
    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            if (entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }
        return files;
    };
    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR) || [];
        console.log(files);
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error',
        });
    }
});


export default app;