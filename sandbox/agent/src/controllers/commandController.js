import { exec } from "child_process";

const WORKING_DIR = "/workspace";

export const ExecuteCommand = async (req, res) => {
    const { command } = req.body;
    try {
        if (!command || typeof command !== "string") {
            return res.status(400).json({
                message: "Invalid command provided",
                status: "error",
            });
        }

        exec(
            command,
            {
                cwd: WORKING_DIR,
                timeout: 30_000,
                maxBuffer: 1024 * 1024,
            },
            (error, stdout, stderr) => {
                if (error) {
                    return res.status(500).json({
                        message: `Error executing command: ${error.message}`,
                        status: "error",
                        success: false,
                        command,
                        stdout,
                        stderr,
                        error: error.message,
                        exitCode: error.code ?? 1
                    });
                }
                res.status(200).json({
                    message: "Command executed successfully",
                    status: "success",
                    success: true,
                    command,
                    stdout,
                    stderr,
                    exitCode: 0
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            message: `Error executing command: ${error.message}`,
            status: "error",
            success: false
        });
    }
}