import { v7 as uuid } from 'uuid';
import { createPods, deletePods } from '../kubernetes/pod.js';
import { createService, deleteService } from '../kubernetes/service.js';
import redis from '../config/redis.js';
import axios from 'axios';
import SandboxModel from '../schema/sandboxModel.js';

// export const startSandbox = async (req, res) => {
//     try {
//         const sandboxId = uuid();


//         const userId = req.user.id || req.user._id;
//         const userEmail = req.user.email;

//         const previewUrl = `http://sandbox-${sandboxId}.preview.localhost`;


//         await createPods(sandboxId, userId);
//         await createService(sandboxId);

//         await redis.set(
//             `sandbox:active:${sandboxId}`,
//             "active",
//             "EX",
//             300
//         );

//         try {
//             const response = await axios.post(
//                 `http://notification-service/api/send-notification`,
//                 {
//                     recipient: userEmail,
//                     message: `Your sandbox ${sandboxId} is now running! Access it at ${previewUrl}`,
//                     subject: 'Sandbox Environment Started',
//                     channel: 'email'
//                 }
//             );
//         } catch (notificationErr) {
//             console.error("Failed to send notification for sandbox start:", notificationErr.message);
//         }

//         // 3. Persist Sandbox Record in MongoDB
//         let savedSandbox = null;
//         try {
//             savedSandbox = await SandboxModel.create({
//                 sandboxId,
//                 userId,
//                 userEmail,
//                 name: req.body?.name || `Sandbox ${sandboxId.slice(0, 8)}`,
//                 status: 'running',
//                 previewUrl,
//                 podName: `sandbox-${sandboxId}-pod`,
//                 serviceName: `sandbox-${sandboxId}-service`,
//                 lastAccessedAt: new Date(),
//                 metadata: {
//                     clientIp: req.ip,
//                     userAgent: req.headers['user-agent'],
//                 },
//             });
//             console.log(`Sandbox ${sandboxId} record stored in DB for userId: ${userId}`);
//         } catch (dbErr) {
//             console.error('Failed to save sandbox record to DB:', dbErr.message);
//             // We still return sandboxId so user can use provisioned resources, but log error
//         }

//         return res.status(200).json({
//             success: true,
//             message: 'Sandbox Environment started successfully',
//             sandboxId,
//             previewUrl,
//             sandbox: savedSandbox,
//         });
//     } catch (error) {
//         console.error('Sandbox start failed:', error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

export const mySandboxes = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const sandboxes = await SandboxModel.find({
            userId,
            status: { $ne: 'terminated' },
        }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            sandboxes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user sandboxes.',
            error: error.message,
        });
    }
}

export const terminateSandbox = async (req, res) => {
    const { sandboxId } = req.params;

    try {
        // Delete Kubernetes resources
        await deletePods(sandboxId);
        await deleteService(sandboxId);

        // Update DB status to terminated
        req.sandbox.status = 'terminated';
        await req.sandbox.save();

        try {
            const response = await axios.post(
                `http://notification-service/api/send-notification`,
                {
                    recipient: req.sandbox.userEmail,
                    message: `Your sandbox ${sandboxId} has been terminated.`,
                    subject: 'Sandbox Environment Terminated',
                    channel: 'email'
                }
            );
        } catch (notificationErr) {
            console.error("Failed to send notification for sandbox termination:", notificationErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Sandbox ${sandboxId} terminated successfully.`,
        });
    } catch (error) {
        console.error(`Failed to terminate sandbox ${sandboxId}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Failed to terminate sandbox resources.',
            error: error.message,
        });
    }
}

export const updateSandbox = async (req, res) => {
    try {
        if (req.body.name) {
            req.sandbox.name = req.body.name.trim();
        }
        await req.sandbox.save();

        return res.status(200).json({
            success: true,
            sandbox: req.sandbox,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update sandbox.',
            error: error.message,
        });
    }
}

//this function is used to create a sandbox record in the database without starting the Kubernetes resources. It can be used for testing or pre-provisioning sandboxes.
export const createSandbox = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        let sandboxExists = await SandboxModel.findOne({ userId, status: { $ne: 'terminated' } });

        if (sandboxExists) {
            return res.status(200).json({
                success: false,
                message: 'A sandbox is already provisioned for this user.',
            });
        }

        const sandboxId = uuid();
        const userEmail = req.user.email;

        const previewUrl = `http://sandbox-${sandboxId}.preview.localhost`;

        const savedSandbox = await SandboxModel.create({
            sandboxId,
            userId,
            userEmail,
            name: req.body?.name || `Sandbox ${sandboxId.slice(0, 8)}`,
            status: 'stopped', // Since we are not starting the Kubernetes resources
            previewUrl,
            podName: `sandbox-${sandboxId}-pod`,
            serviceName: `sandbox-${sandboxId}-service`,
            lastAccessedAt: new Date(),
            metadata: {
                clientIp: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        return res.status(201).json({
            success: true,
            sandbox: savedSandbox,
        });
    } catch (error) {
        console.error("Failed to create sandbox record:", error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create sandbox record.',
            error: error.message,
        });
    }
}

export const createProject = async (req, res) => {
    try {
        const { sandboxId } = req.params;

        const userId = req.user.id || req.user._id;

        const {
            projectName = "Default Project",
            projectDescription = ""
        } = req.body;

        if (
            typeof projectName !== "string" ||
            !projectName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Project name is required."
            });
        }

        const sandbox = await SandboxModel.findOne({
            sandboxId,
            userId
        });

        if (!sandbox) {
            return res.status(404).json({
                success: false,
                message: "Sandbox not found."
            });
        }

        const savedProject = await ProjectModel.create({
            projectId: uuid(),
            sandboxId,
            userId,

            name: projectName.trim(),

            description:
                typeof projectDescription === "string"
                    ? projectDescription.trim()
                    : "",

            status: "stopped"
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully.",
            project: savedProject
        });

    } catch (error) {
        console.error("Failed to create project:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create project.",
            error: error.message
        });
    }
};
//this function is used to start a created sandbox with a project. It will start the Kubernetes resources and associate the project with the sandbox. and it checks the project is valid and belongs to the user before starting the sandbox.
export const startSandboxWithProject = async (req, res) => {
    try {
        const { sandboxId, projectId } = req.params;

        // Check if the sandbox exists and belongs to the user
        const sandbox = await SandboxModel.findOne({ sandboxId, userId: req.user.id || req.user._id });

        if (!sandbox) {
            return res.status(404).json({
                success: false,
                message: 'Sandbox not found.',
            });
        }

        // Check if the project exists and belongs to the user
        const project = await ProjectModel.findOne({
            projectId,
            sandboxId,
            userId
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or does not belong to the user.',
            });
        }

        // Start Kubernetes resources
        await createPods(sandboxId, req.user.id || req.user._id);
        await createService(sandboxId);

        // Update sandbox status to running
        sandbox.status = 'running';
        sandbox.currentProjectId = projectId;
        await sandbox.save();

        return res.status(200).json({
            success: true,
            message: 'Sandbox started successfully with the project.',
            sandbox,
        });
    } catch (error) {
        console.error("Failed to start sandbox with project:", error);
        return res.status(500).json({
            success: false,
            message: 'Failed to start sandbox with project.',
            error: error.message,
        });
    }
}
