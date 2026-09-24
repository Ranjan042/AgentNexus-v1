import k8sApi from "./config.js";

export const createPods = async (sandboxId) => {
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
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],
            initContainers: [
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
                }
            ],
            containers: [
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
                {
                    name: `sandbox-${sandboxId}-agent-container`,
                    image: "agent-image:latest",
                    imagePullPolicy: "Always",

                    ports: [
                        {
                            containerPort: 3000,
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
                }
            ]
        }
    };

    try {
        console.log("Sending pod manifest to Kubernetes...");

        const response = await k8sApi.createNamespacedPod({
            namespace: "default",
            body: podManifest
        });
        console.log("Pod creation response:", response);
        console.log("POD CREATED SUCCESSFULLY");
        console.log("Pod name:", podName);

        return response;

    } catch (error) {
        console.error("========== POD CREATION FAILED ==========");
        console.error("Message:", error.message);
        console.error("Status:", error.response?.statusCode);
        console.error("Body:", error.response?.body);
        console.error("Full error:", error);
        console.error("=========================================");

        throw error;
    }
};
