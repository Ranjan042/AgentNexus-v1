import k8sApi from "./config.js";

export const createService = async (sandboxId) => {
    console.log("Creating service for sandbox:", `sandbox-${sandboxId}-service`);

    const serviceManifest = {
        apiVersion: "v1",
        kind: "Service",


        metadata: {
            name: `sandbox-${sandboxId}-service`,
            labels: {
                app: `sandbox-${sandboxId}`
            }
        },

        spec: {
            selector: {
                app: `sandbox-${sandboxId}`
            },
            ports: [
                {
                    protocol: "TCP",
                    port: 5173,
                    targetPort: 5173
                }
            ],
            type: "ClusterIP"
        }
    };

    try {
       const response = await k8sApi.createNamespacedService({
           namespace: "default",
           body: serviceManifest
       });
        console.log("Service created:", response.metadata.name);
        // console.log("Service created:", result.metadata.name);
        return response;
    } catch (error) {
        console.error("Error creating service:", error);
        throw error;
    }

};
