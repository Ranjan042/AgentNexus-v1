import k8sApi from "./config.js";

export const createService = async (sandboxId) => {
    const serviceName = `sandbox-${sandboxId}-service`;

    console.log("Creating service for sandbox:", serviceName);

    const serviceManifest = {
        apiVersion: "v1",
        kind: "Service",

        metadata: {
            name: serviceName,
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
                    name: "preview",
                    protocol: "TCP",
                    port: 5173,
                    targetPort: 5173
                },
                {   
                    name: "agent",
                    protocol: "TCP",
                    port: 3000,
                    targetPort: 3000
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
        console.log("========== SERVICE CREATED ==========");
        console.log("Response:", response);
        console.log(
            "Service created:",
           serviceName
        );

        return response;

    } catch (error) {
        console.error("========== SERVICE CREATION FAILED ==========");
        console.error("Message:", error.message);
        console.error("Status:", error.response?.statusCode);
        console.error("Body:", error.response?.body);
        console.error("==============================================");

        throw error;
    }
};
