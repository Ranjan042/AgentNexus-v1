import k8sApi from "./config.js";


export const createPods = async (sandboxId, userId) => {
    const podName = `sandbox-${sandboxId}-pod`;

    console.log("Creating pod:", podName);

    const podManifest = {
        apiVersion: "v1",
        kind: "Pod",

        metadata: {
            name: podName,
            labels: {
                app: `sandbox-${sandboxId}`
            }
        },

        spec: {
            terminationGracePeriodSeconds: 120,

            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],

            // Init containers execute sequentially
            initContainers: [

                // 1. Copy template files
                {
                    name: `sandbox-${sandboxId}-init-container`,
                    image: "template-image:latest",
                    imagePullPolicy: "Always",

                    command: [
                        "sh",
                        "-c",
                        "cp -r /workspace/. /seed/"
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/seed"
                        }
                    ]
                },

                // 2. Restore previous files from S3
                {
                    name: `${sandboxId}-restore`,
                    image: "agentnexus-persistence:latest",
                    imagePullPolicy: "Always",

                    command: [
                        "node",
                        "/sync/restore.js"
                    ],

                    env: [
                        {
                            name: "USER_ID",
                            value: userId
                        },
                        {
                            name: "SANDBOX_ID",
                            value: sandboxId
                        }
                    ],

                    envFrom: [
                        {
                            secretRef: {
                                name: "aws-secrets"
                            }
                        }
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],

                    resources: {
                        limits: {
                            memory: "500Mi",
                            cpu: "500m"
                        },
                        requests: {
                            memory: "250Mi",
                            cpu: "250m"
                        }
                    }
                }
            ],

            // Application containers
            containers: [

                // 3. Preview container
                {
                    name: `sandbox-${sandboxId}-preview-container`,
                    image: "template-image:latest",
                    imagePullPolicy: "Always",

                    ports: [
                        {
                            containerPort: 5173,
                            name: "http"
                        }
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],

                    resources: {
                        limits: {
                            memory: "500Mi",
                            cpu: "500m"
                        },
                        requests: {
                            memory: "250Mi",
                            cpu: "250m"
                        }
                    }
                },

                // 4. Agent container
                {
                    name: `sandbox-${sandboxId}-agent-container`,
                    image: "agent-image:latest",
                    imagePullPolicy: "Always",

                    ports: [
                        {
                            containerPort: 3000,
                            name: "agent-http"
                        }
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],

                    resources: {
                        limits: {
                            memory: "500Mi",
                            cpu: "500m"
                        },
                        requests: {
                            memory: "250Mi",
                            cpu: "250m"
                        }
                    }
                },

                // 5. Persistence sidecar - Chokidar + S3
                {
                    name: `${sandboxId}-persistence`,
                    image: "agentnexus-persistence:latest",
                    imagePullPolicy: "Always",

                    command: [
                        "node",
                        "/sync/watcher.js"
                    ],

                    env: [
                        {
                            name: "USER_ID",
                            value: userId
                        },
                        {
                            name: "SANDBOX_ID",
                            value: sandboxId
                        }
                    ],

                    envFrom: [
                        {
                            secretRef: {
                                name: "aws-secrets"
                            }
                        }
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ],

                    resources: {
                        limits: {
                            memory: "300Mi",
                            cpu: "300m"
                        },
                        requests: {
                            memory: "100Mi",
                            cpu: "100m"
                        }
                    }
                }
            ]
        }
    };

    try {

        const response = await k8sApi.createNamespacedPod({
            namespace: "default",
            body: podManifest
        });

        return response;

    } catch (error) {
        console.error(`Failed to create pod ${podName}:`, error.message);
        throw error;
    }
};


export const deletePods = async (sandboxId) => {
    const podName = `sandbox-${sandboxId}-pod`;

    console.log("Deleting pod:", podName);

    try {
        const response = await k8sApi.deleteNamespacedPod({
            name: podName,
            namespace: "default"
        });


        return response;

    } catch (error) {
        if (error.response?.statusCode === 404) {
            console.warn(`Pod ${podName} not found, skipping delete.`);
            return null;
        }

        console.error(`Failed to delete pod ${podName}:`, error.message);

        throw error;
    }
};


