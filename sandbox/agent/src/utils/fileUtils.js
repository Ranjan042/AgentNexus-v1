import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const WORKING_DIR = "/workspace";

export function getSafePath(filePath) {
    const fullPath = path.join(WORKING_DIR, filePath);

    if (!fullPath.startsWith(WORKING_DIR)) {
        throw new Error("Invalid path");
    }

    return fullPath;
}

export async function searchFiles(query, searchPath = WORKING_DIR) {
    if (!query || !query.trim()) {
        return {
            files: [],
            matches: [],
        }
    }

    const searchQuery = query.trim();

    let files = [];

    try {
        const { stdout } = await execFileAsync("rg", ["--files", searchPath], { maxBuffer: 10 * 1024 * 1024 });
        files = stdout.split("\n").filter(Boolean).filter((file) => {
            file.toLowerCase().includes(searchQuery.toLowerCase());
        })
            .map((file) => ({
                path: file,
                type: "file",
            }));
    } catch (error) {
        if (error.code !== 1) {
            throw error;
        }
    }

    let matches = [];

        try {
        const { stdout } = await execFileAsync(
            "rg",
            [
                "--line-number",
                "--with-filename",
                "--color",
                "never",
                "--smart-case",
                searchQuery,
                searchPath,
            ],
            {
                maxBuffer: 20 * 1024 * 1024,
            }
        );

                matches = stdout
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                const firstColon = line.indexOf(":");

                if (firstColon === -1) {
                    return null;
                }

                const filePath = line.slice(0, firstColon);

                const remaining = line.slice(firstColon + 1);

                const secondColon = remaining.indexOf(":");

                if (secondColon === -1) {
                    return null;
                }

                const lineNumber = remaining.slice(0, secondColon);

                const text = remaining.slice(secondColon + 1);

                return {
                    path: filePath,
                    line: Number(lineNumber),
                    text: text.trim(),
                    type: "text",
                };
            })
            .filter(Boolean);
    } catch (error) {
        // rg returns 1 when no matches are found
        if (error.code !== 1) {
            throw error;
        }
    }

    return {
        query: searchQuery,
        files,
        matches,
    }
}

