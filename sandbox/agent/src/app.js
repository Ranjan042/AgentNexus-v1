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

function getSafePath(filePath) {
    const fullPath = path.join(WORKING_DIR, filePath);

    if (!fullPath.startsWith(WORKING_DIR)) {
        throw new Error("Invalid path");
    }

    return fullPath;
}

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

app.get("/readfiles", async (req, res) => {
    try {
        const { files } = req.query;
        const filesToRead = files.split(",");
        const filesContent = await Promise.all(
            filesToRead.map(async (file) => {
                try {
                    const content = await fs.promises.readFile(
                        path.join(WORKING_DIR, file),
                        "utf-8"
                    );
                    return {
                        file,
                        content,
                    };
                } catch (error) {
                    return {
                        file,
                        error: error.message,
                    };
                }
            })
        );
        res.status(200).json({
            message: "Files read successfully",
            files: filesContent,
        });

    } catch (error) {
        return res.status(500).json({
            message: `Error reading files: ${error.message}`,
            status: "error",
        })
    }
})

app.patch("/updatefiles", async (req, res) => {
    const updates = req.body.updates || [];

    try {
        await Promise.all(
            updates.map(async (update) => {
                const { path, content } = update;
                await fs.promises.mkdir(path.dirname(getSafePath(path)), {
                    recursive: true,
                })
                await fs.promises.writeFile(
                    getSafePath(path),
                    content
                );
            })
        );
        res.status(200).json({
            message: "Files updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: `Error updating files: ${error.message}`,
            status: "error",
        });
    }
})

app.delete("/deletefiles", async (req, res) => {
    const { files } = req.query;
    const filesToDelete = files.split(",");
    try {
        await Promise.all(
            filesToDelete.map(async (file) => {
                await fs.promises.unlink(getSafePath(file));
            })
        );
        res.status(200).json({
            message: "Files deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: `Error deleting files: ${error.message}`,
            status: "error",
        });
    }
})

app.post("/movefiles", async (req, res) => {
    try {
        const {files} = req.body;

        if(!Array.isArray(files)) {
            return res.status(400).json({
                message: "files must be an array",
                status: "error",
            });
        }

        await Promise.all(
            files.map(async (file) => {
                const {from, to} = file;
                await fs.promises.mkdir(path.dirname(getSafePath(to)), {
                    recursive: true,
                })
                await fs.promises.rename(getSafePath(from), getSafePath(to));
            })
        );
        res.status(200).json({
            message: "Files moved successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: `Error moving files: ${error.message}`,
            status: "error",
        });
    }
})


// app.get("searchfiles", async (req, res) => {
//     try {
//         const { search } = req.query;
//         const files = await fs.promises.readdir(WORKING_DIR);
//         const filteredFiles = files.filter((file) => file.includes(search));
//         res.status(200).json({
//             message: "Files found successfully",
//             files: filteredFiles,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error searching files: ${error.message}`,
//             status: "error",
//         });
//     }
// })


export default app;