# AgentNexus

### An AI-Powered Development Sandbox with Multi-Agent Orchestration

AgentNexus is a work-in-progress AI-powered development platform built using a microservices architecture. It combines AI agent orchestration, development sandboxes, interactive terminals, and cloud-native infrastructure to explore how AI agents can assist with software development.

The project uses **LangGraph** to orchestrate AI agents and **Docker** and **Kubernetes** to manage containerized development environments. It also explores service routing, WebSocket communication, terminal emulation, and deployment automation.

> **Project status:** Under active development 🚧

## Demo

Watch the project demo: **[AgentNexus Demo Video](https://youtu.be/GNVxxJofgY8)**

Replace the placeholder URL with your demo video's shareable link.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Microservices Architecture](#microservices-architecture)
- [Multi-Agent System](#multi-agent-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Kubernetes Secret Management](#kubernetes-secret-management)
- [Docker and Kubernetes](#docker-and-kubernetes)
- [Interactive Terminal](#interactive-terminal)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

AgentNexus is an experimental platform designed to explore the engineering challenges involved in building AI-powered development environments.

The application separates its functionality into independent microservices, allowing individual features to have their own responsibilities, dependencies, environment configuration, and deployment setup.

The AI orchestration service uses LangGraph to coordinate agents and tools. These agents can interact with the development sandbox to perform supported file operations and execute commands through the terminal infrastructure.

The project also provides hands-on experience with containerization, Kubernetes networking, service discovery, Ingress configuration, and deployment automation.

### Project Goals

- Build an AI-powered development sandbox.
- Implement a microservices architecture using Node.js services.
- Create multi-agent workflows using LangGraph.
- Enable AI agents to interact with files and terminal tools.
- Build Docker images and manage containerized services.
- Deploy and connect microservices using Kubernetes.
- Implement service routing through a router server.
- Explore interactive terminal communication using WebSockets and `node-pty`.
- Manage service-specific environment variables and Kubernetes Secrets.
- Understand real-world DevOps and cloud-native application architecture.

## Key Features

### AI-Powered Multi-Agent System

- Multi-agent orchestration using LangGraph.
- Graph-based workflows with state, nodes, and routing logic.
- Tool-based interaction with the development sandbox.
- Structured agent decisions and results using Zod schemas.
- Integration with Google Gemini through the LangChain ecosystem.

### Development Sandbox

- Containerized development environments.
- File listing and reading.
- File searching and updating.
- File moving and deletion.
- Terminal command execution through the sandbox infrastructure.
- Interactive terminal sessions using WebSockets and `node-pty`.

### Microservices Architecture

- Separate services for different application responsibilities.
- Service-specific environment configuration.
- Independent dependency management.
- HTTP-based service communication.
- Centralized routing through a router service.
- Kubernetes Service-based internal networking.

### DevOps and Infrastructure

- Docker image creation and container execution.
- Kubernetes Pods, Deployments, and Services.
- Kubernetes Ingress for incoming traffic routing.
- Kubernetes Secrets for sensitive configuration.
- Skaffold-based development and deployment workflows.
- Container networking and service discovery.

Feature availability depends on the current implementation.

## Architecture

AgentNexus uses a microservices architecture in which separate services handle different application responsibilities.

High-level logical flow:

```text
User
 |
 v
React Frontend
 |
 v
Kubernetes Ingress
 |
 v
Router Service
 |-------------------|--------------------|
 v                   v                    v
Authentication     Sandbox Service     AI Orchestration
Service                                  Service
                                            |
                                            v
                                     LangGraph Workflow
                                            |
                           --------------------------------
                           |              |               |
                           v              v               v
                      Research Agent   Code Agent     Review/Debug
                           |
                           v
                      Sandbox Tools
                           |
                           v
                       Sandbox Pod
                           |
                           v
                 Workspace / Execution Environment
                           |
                           v
                  WebSocket and node-pty

Database / Redis are used where configured.
```

The diagram represents the logical design; verify individual service connections and database dependencies against the current codebase.

### Architecture Principles

- **Separation of concerns:** Each microservice is responsible for a specific set of features.
- **Independent configuration:** Services maintain their own environment configuration.
- **Containerization:** Docker packages services into deployable images.
- **Service discovery:** Kubernetes Services provide stable internal endpoints.
- **Centralized routing:** The router directs requests to the appropriate services.
- **AI orchestration:** LangGraph manages the execution flow between agents and tools.
- **Configuration management:** Kubernetes Secrets provide sensitive configuration to workloads.

## Microservices Architecture

Each microservice has its own responsibility and configuration. This separation makes the application easier to develop, debug, and extend.

| Component | Responsibility |
|---|---|
| Frontend | Provides the user interface and communicates with backend APIs. |
| Router Service | Routes requests to the appropriate backend services. |
| Authentication Service | Handles authentication-related functionality. |
| Sandbox Service | Manages sandbox operations and execution environments. |
| AI Orchestration Service | Coordinates AI agents and their workflows. |
| Sandbox Agent | Provides sandbox-side capabilities, including terminal and file operations, as configured. |

The exact service names, responsibilities, and deployment boundaries should match the current repository.

### Service Communication

Services communicate through configured HTTP endpoints and Kubernetes networking. WebSocket connections are used for interactive terminal functionality.

Kubernetes Services provide stable network endpoints for workloads, while Ingress routes supported incoming traffic into the application.

## Multi-Agent System

AgentNexus explores a graph-based multi-agent architecture using LangGraph.

### Agent Responsibilities

- **Research Agent:** Explores the task and gathers relevant information from the available context and tools.
- **Code Agent:** Uses supported sandbox tools to read and modify project files.
- **Review Agent:** Reviews proposed changes and identifies potential issues or improvements.
- **Debug Agent:** Investigates execution errors and uses available tools to help diagnose problems.

These descriptions represent intended responsibilities; the actual agents and their capabilities depend on the current graph implementation.

### Workflow

1. A user submits a development task.
2. The AI orchestration service initializes the workflow.
3. LangGraph manages the state and determines the next operation.
4. The selected agent invokes the tools available to it.
5. The tools interact with the sandbox service.
6. Results are returned to the graph workflow.
7. The workflow continues according to its routing logic.
8. The final result is returned to the application.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS

### Backend and Microservices

- Node.js
- Express.js
- WebSocket (`ws`)
- `node-pty`

### AI and Agent Orchestration

- LangChain
- LangGraph
- Google Gemini integration
- Zod

### Infrastructure and DevOps

- Docker
- Kubernetes
- Kubernetes Ingress
- Skaffold
- YAML manifests

### Additional Technologies

- Git and GitHub
- MongoDB
- Redis

## Project Structure

AgentNexus contains multiple services, each with its own dependencies and configuration. The exact structure may change during development.

```text
AgentNexus-v1/
├── frontend/
├── router/
├── auth/
├── sandbox/
├── ai_orch/
├── k8s/
│   ├── secret.example.yml
│   ├── secrets.yml              # Local only; do not commit
│   └── ...
├── skaffold.yml
└── README.md
```

This is a high-level illustration. Use the actual directory and manifest names from the repository if they differ.

## Prerequisites

Install the tools required to develop and run the application:

- Git
- Node.js and npm
- Docker Desktop or Docker Engine
- A running Kubernetes cluster
- `kubectl`
- Skaffold
- Access to the configured AI model provider
- Required database or cache services, if enabled

Verify the installations:

```bash
node --version
npm --version
docker --version
kubectl version --client
skaffold version
```

Before continuing, make sure Docker is running and your Kubernetes cluster is enabled. Verify that `kubectl` is connected to the intended cluster:

```bash
kubectl config current-context
kubectl get nodes
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ranjan042/AgentNexus-v1.git
cd AgentNexus-v1
```

### 2. Configure Environment Variables

Each microservice uses its own environment configuration for local development.

Navigate to each service directory and configure the environment variables required by that service. For example:

```powershell
cd frontend
```

Create or update the service's `.env` file according to its `.env.example`, if provided. Repeat this process for the router, authentication, sandbox, and AI orchestration services as applicable.

Environment file names, locations, and variable names must match the actual service implementation.

### 3. Install Dependencies (For Local Service Development)

Install dependencies separately for each Node.js service. For example:

```bash
cd frontend
npm install
```

Repeat for each backend service that you want to run locally.

### 4. Start an Individual Service (Optional)

Use the npm scripts defined in each service's `package.json`. For example, if the frontend defines the standard Vite development script:

```bash
npm run dev
```

Backend startup commands depend on the scripts defined in their respective `package.json` files. Running one service independently does not automatically start its dependent microservices.

### 5. Configure Kubernetes Secrets

Complete the [Kubernetes Secret Management](#kubernetes-secret-management) steps below before starting the full Kubernetes development environment.

### 6. Apply the NGINX Ingress Controller

AgentNexus uses Kubernetes Ingress for incoming traffic routing. Apply the NGINX Ingress controller manifest appropriate for your cluster.

For a standard cloud-style installation, run:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml
```

Wait for the controller to become ready:

```bash
kubectl get pods -n ingress-nginx
kubectl get services -n ingress-nginx
```

**Local cluster note:** If you use Kind, Docker Desktop, Minikube, or another local Kubernetes setup, the appropriate ingress-nginx installation method may differ. Follow the ingress-nginx installation instructions for your cluster provider if the cloud manifest does not work as expected.

### 7. Apply Sandbox RBAC

Apply the sandbox Role-Based Access Control configuration before starting Skaffold:

```bash
kubectl apply -f k8s/sandbox-rabac.yml
```

> Make sure the filename matches the repository. If the manifest is actually named `sandbox-rbac.yml` (without the extra `a`), use that exact filename in the command instead.

### 8. Start the Kubernetes Development Environment

Once the cluster is running, secrets are applied, the Ingress controller is installed, and sandbox RBAC is configured, run:

```bash
skaffold dev
```

Skaffold manages the application's development workflow according to `skaffold.yml`. Ensure that the relevant Kubernetes Deployments reference `agentnexus-secret` so the required environment variables are available to their containers.

## Environment Configuration

AgentNexus maintains separate environment configuration for individual microservices. This keeps configuration specific to each service and avoids unnecessarily sharing unrelated settings.

### Common Configuration Categories

| Configuration | Purpose |
|---|---|
| Service ports | Configure the ports on which services listen. |
| Service URLs | Define endpoints used to communicate with other services. |
| Database URLs | Configure database connections where required. |
| AI provider credentials | Authenticate requests to the configured model provider. |
| Authentication secrets | Configure token signing and authentication integrations. |
| Redis connection settings | Configure Redis access where required. |

Use the actual variable names defined in each service's code.

### Environment File Security

Add real environment files to `.gitignore`, while allowing example files to be committed. For example:

```gitignore
.env
.env.*
!.env.example

k8s/secrets.yml
```

If your repository uses additional environment file names or directories, adjust these rules accordingly. Use `.env.example` files containing placeholder values to document required configuration without exposing credentials.

## Kubernetes Secret Management

AgentNexus uses Kubernetes Secrets to manage sensitive configuration, including AI provider API keys, database credentials, Google OAuth credentials, and authentication secrets.

The Kubernetes Secret is named `agentnexus-secret`. The actual Secret configuration is stored locally and excluded from GitHub, while `k8s/secret.example.yml` is committed as a template.

### 1. Create Your Secret File

After cloning the repository, copy the example file to create your local Secret configuration.

**Windows PowerShell:**

```powershell
Copy-Item k8s/secret.example.yml k8s/secrets.yml
```

**Linux / macOS:**

```bash
cp k8s/secret.example.yml k8s/secrets.yml
```

### 2. Configure Your Credentials

Open `k8s/secrets.yml` and replace the placeholder values with your actual credentials.

Example structure from `k8s/secret.example.yml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: agentnexus-secret
type: Opaque
stringData:
  MISTRALAI_API_KEY: "your-mistral-api-key"
  GEMINI_API_KEY: "your-gemini-api-key"
  TAVILY_API_KEY: "your-tavily-api-key"
  MONGO_URI: "your-mongodb-uri"
  GOOGLE_CLIENT_ID: "your-google-client-id"
  GOOGLE_CLIENT_SECRET: "your-google-client-secret"
  GOOGLE_CALLBACK_URL: "http://localhost/api/auth/google/callback"
  SESSION_SECRET: "replace-with-a-long-random-secret"
  JWT_SECRET: "replace-with-a-long-random-secret"
```

The values above are placeholders, not working credentials. Obtain the required API keys and credentials from their respective providers.

For Google OAuth, ensure that `GOOGLE_CALLBACK_URL` matches the callback URL expected by your application and the redirect URI configured in Google Cloud Console.

### 3. Apply the Kubernetes Secret

Ensure that your Kubernetes cluster is running and `kubectl` is connected to the correct cluster.

```bash
kubectl apply -f k8s/secrets.yml
```

Verify that the Secret exists:

```bash
kubectl get secret agentnexus-secret
```

The command may report `created` the first time or `configured` when an existing Secret is updated.

### 4. Reference the Secret in Kubernetes Deployments

In the relevant Kubernetes Deployment manifest, use `envFrom` to load the Secret's keys as environment variables.

Example:

```yaml
spec:
  containers:
    - name: your-container
      image: your-image
      envFrom:
        - secretRef:
            name: agentnexus-secret
```

Replace `your-container` and `your-image` with the appropriate values for your Deployment.

With `envFrom`, all keys in the referenced Secret are exposed as environment variables inside the container. The Secret must exist in the same Kubernetes namespace as the Deployment that references it.

### 5. Keep Your Credentials Secure

- Never commit `k8s/secrets.yml` or real credentials to GitHub.
- Never share API keys, database credentials, OAuth secrets, or authentication secrets publicly.
- Use strong, randomly generated values for `SESSION_SECRET` and `JWT_SECRET`.
- Configure encryption at rest and appropriate access controls for Kubernetes Secrets where supported.
- Restrict access to Kubernetes Secrets using appropriate Role-Based Access Control (RBAC) permissions.
- Rotate credentials immediately if they are accidentally exposed.
- Avoid printing sensitive environment variables or Secret values in application logs.

Kubernetes Secrets provide a mechanism for managing sensitive configuration, but their security depends on proper cluster configuration, access controls, and credential-handling practices.

## Docker and Kubernetes

AgentNexus uses Docker and Kubernetes to explore containerized applications and cloud-native deployment.

### Docker

Docker images package application code and dependencies into containers.

Build an image from the directory containing the appropriate Dockerfile:

```bash
docker build -t agentnexus-service:latest .
```

Run a container with the ports and configuration required by that service:

```bash
docker run --rm agentnexus-service:latest
```

These are generic examples. Individual services may require environment variables, ports, volumes, and networking configuration.

### Kubernetes

Kubernetes manages application workloads and service communication.

Common resources include:

- **Pods:** Run containers.
- **Deployments:** Manage replicated application workloads.
- **Services:** Provide stable networking endpoints.
- **Ingress:** Routes incoming HTTP traffic.
- **Secrets:** Supply sensitive configuration.
- **ConfigMaps:** Supply non-sensitive configuration.

Useful commands:

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get ingress
```

Inspect a Pod:

```bash
kubectl describe pod <pod-name>
```

View application logs:

```bash
kubectl logs <pod-name>
```

For a multi-container Pod:

```bash
kubectl logs <pod-name> -c <container-name>
```

### Skaffold

Skaffold can automate image building and Kubernetes deployment during development. Use the workflow configured in `skaffold.yml` and verify that the correct Kubernetes context, image tags, and manifests are selected.

## Interactive Terminal

AgentNexus explores interactive terminal functionality using WebSockets and `node-pty`.

The terminal infrastructure allows a client to communicate with a shell process running in the configured execution environment.

General flow:

1. The frontend establishes a WebSocket connection.
2. The connection is routed through the configured proxy or backend service.
3. The sandbox-side terminal service manages the pseudo-terminal.
4. Terminal input is forwarded to the shell process.
5. Terminal output is transmitted back through the WebSocket connection.

WebSocket routing requires the relevant proxy and backend to support protocol upgrades and the correct connection paths.

## Development Workflow

A typical development workflow involves:

1. Selecting the microservice responsible for the feature.
2. Updating that service's code and environment configuration.
3. Testing the service independently where possible.
4. Building or rebuilding its Docker image.
5. Updating Kubernetes configuration when necessary.
6. Deploying changes through the configured development workflow.
7. Verifying inter-service communication.
8. Inspecting application logs and testing the affected functionality.

## Troubleshooting

### Pods Are Not Starting

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

Check image availability, configuration, resource limits, and Pod events.

### Service Communication Fails

```bash
kubectl get services
kubectl get endpoints
kubectl get ingress
```

Verify Service selectors, ports, target ports, namespace configuration, and routing rules.

### Environment Variables Are Missing

Check that:

- The environment file is loaded in local development.
- The relevant Deployment references the correct Secret.
- The required key exists in the Secret.
- The Secret is in the correct namespace.
- The application reads the expected environment variable name.

### NGINX Ingress Is Not Working

```bash
kubectl get pods -n ingress-nginx
kubectl get services -n ingress-nginx
kubectl get ingress
```

Check that the controller Pod is ready, the Ingress resource has the expected host and rules, and the local hostnames resolve to the correct address for your cluster setup.

### WebSocket Connection Fails

Verify the client URL, backend endpoint, proxy configuration, WebSocket upgrade handling, and sandbox availability.

### AI Requests Fail

Check provider credentials, API availability, rate limits, graph configuration, and agent tool responses.

## Security Considerations

Because AgentNexus explores AI agents that can interact with files and execute terminal commands, security is an important part of its design.

- Keep credentials out of source control.
- Restrict access to Kubernetes Secrets.
- Apply authentication and authorization to sensitive endpoints.
- Isolate sandbox execution environments.
- Validate file paths and tool inputs.
- Restrict terminal command execution according to the intended trust model.
- Avoid exposing internal services unnecessarily.
- Apply resource limits and lifecycle cleanup to sandbox workloads.

Containerization alone does not guarantee secure isolation. Production deployments require additional security controls.

## Roadmap

- [ ] Improve multi-agent orchestration and state management.
- [ ] Improve sandbox lifecycle management.
- [ ] Strengthen terminal connectivity and error handling.
- [ ] Document all service APIs.
- [ ] Add automated tests for agents and sandbox tools.
- [ ] Improve Kubernetes deployment reliability.
- [ ] Strengthen sandbox isolation and authorization.
- [ ] Add structured logging and monitoring.
- [ ] Improve local development and deployment documentation.

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the affected functionality.
5. Commit your changes with a descriptive message.
6. Open a pull request.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

## License

Currently, this project does not have a formal open-source license.

You are welcome to explore the code for learning purposes. However, without an explicit license, the code is not automatically free to copy, modify, redistribute, or use commercially.


## Author

**Ranjan Kumar Chaudhary**

- GitHub: [Ranjan042](https://github.com/Ranjan042)
- Repository: [AgentNexus-v1](https://github.com/Ranjan042/AgentNexus-v1)

AgentNexus is a learning-oriented engineering project exploring microservices, AI agent orchestration, development sandboxes, containerization, and cloud-native infrastructure.
