import k8sApi from "./config.js";

export const createPods = async (sandboxId) => {
    const podManifest = {
        apiVersion: "v1",
        kind: "Pod",

        metadata: {
            name: `sandbox-${sandboxId}-pod`,
            labels: {
                app: `sandbox-${sandboxId}`
            }
        },

        spec: {
            containers: [
                {
                    name: `sandbox-${sandboxId}-container`,
                    image: 'template-image:latest',
                    imagePullPolicy: "ifNotPresent",

                    ports: [
                        {
                            containerPort: 5173,
                            name: "http",
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
    }

    try {
        const response = await k8sApi.createNamespacedPod({
            namespace: "default",
            body: podManifest
        });
        console.log(response);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}
