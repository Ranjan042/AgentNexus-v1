
import {
    createPods,
    createService,
    deletePods,
    deleteService,
    getPod
} from "../kubernetes/sandbox.k8s.js";

import { execInPod } from "../kubernetes/exec.js";

const NAMESPACE = process.env.K8S_NAMESPACE || "default";
const CONTAINER_NAME = "agent";

// Project execution configuration
const PROJECTS_DIR = "/workspace/projects";
const PID_DIR = "/tmp/agentnexus-pids";
const LOG_DIR = "/tmp/agentnexus-logs";


// Helper: safely quote shell arguments
const shellQuote = (value) => {
    return "'" + String(value).replace(/'/g, "'\\''") + "'";
};


// Helper: execute a shell command inside sandbox Pod
const execute = async (sandbox, command) => {
    return execInPod({
        namespace: NAMESPACE,
        podName: sandbox.podName,
        containerName: CONTAINER_NAME,
        command: ["/bin/sh", "-lc", command]
    });
};


// 1. ENSURE SANDBOX RESOURCES EXIST

export const ensureSandboxResources = async (sandbox, userId) => {

    let podExists = false;

    try {
        const pod = await getPod(sandbox.podName, NAMESPACE);

        podExists = pod?.status?.phase === "Running";
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }

    if (!podExists) {
        await createPods(sandbox.sandboxId, userId);
    }

    // Ensure Service exists too.
    try {
        await execute(sandbox, "mkdir -p " +
            shellQuote(PROJECTS_DIR) + " " +
            shellQuote(PID_DIR) + " " +
            shellQuote(LOG_DIR));
    } catch (error) {
        // A newly created Pod may need time to become ready.
        throw new Error(
            `Sandbox Pod is not ready: ${error.message}`
        );
    }

    // Your createService helper should be idempotent:
    // create if missing, otherwise leave existing Service unchanged.
    await createService(sandbox.sandboxId);

    return true;
};


// 2. START PROJECT

export const startProject = async (sandbox, project) => {

    const projectPath = project.rootPath;

    const pidFile =
        `${PID_DIR}/${project.projectId}.pid`;

    const logFile =
        `${LOG_DIR}/${project.projectId}.log`;

    // Validate that project directory exists.
    const checkDirectory = await execute(
        sandbox,
        `test -d ${shellQuote(projectPath)}`
    );

    if (checkDirectory?.code !== 0) {
        throw new Error("Project directory does not exist.");
    }

    // Verify package.json exists.
    await execute(
        sandbox,
        `test -f ${shellQuote(`${projectPath}/package.json`)}`
    );

    // Start project in background.
    // Only one project should be active in this sandbox.
    const startCommand = `
        mkdir -p ${shellQuote(PID_DIR)} ${shellQuote(LOG_DIR)}

        rm -f ${shellQuote(pidFile)}

        cd ${shellQuote(projectPath)}

        nohup setsid npm run dev -- --host 0.0.0.0 \
        > ${shellQuote(logFile)} 2>&1 < /dev/null &

        echo $! > ${shellQuote(pidFile)}

        echo "PROJECT_STARTED"
    `;

    const result = await execute(sandbox, startCommand);

    if (result?.code !== 0) {
        throw new Error(
            `Project failed to start: ${result?.stderr || ""}`
        );
    }

    return {
        projectId: project.projectId,
        pidFile,
        logFile,
        status: "running"
    };
};


// 3. STOP PROJECT

export const stopProject = async (sandbox, projectId) => {

    const pidFile =
        `${PID_DIR}/${projectId}.pid`;

    const stopCommand = `
        if [ -f ${shellQuote(pidFile)} ]; then

            PID=$(cat ${shellQuote(pidFile)})

            if kill -0 "$PID" 2>/dev/null; then
                kill -TERM -- "-$PID" 2>/dev/null || kill -TERM "$PID"
            fi

            rm -f ${shellQuote(pidFile)}

        fi

        echo "PROJECT_STOPPED"
    `;

    const result = await execute(sandbox, stopCommand);

    if (result?.code !== 0) {
        throw new Error(
            `Failed to stop project: ${result?.stderr || ""}`
        );
    }

    return {
        projectId,
        status: "stopped"
    };
};


// 4. STOP SANDBOX RESOURCES

export const stopSandboxResources = async (sandbox) => {

    // Delete Kubernetes Service first.
    try {
        await deleteService(sandbox.serviceName, NAMESPACE);
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }

    // Delete Kubernetes Pod.
    try {
        await deletePods(sandbox.podName, NAMESPACE);
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }

    return {
        sandboxId: sandbox.sandboxId,
        status: "stopped"
    };
};
