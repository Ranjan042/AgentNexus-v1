import express from "express"
import morgan from "morgan"
import agentRoutes from "./routes/agentRoutes.js"


const app=express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/agent",agentRoutes);


export default app;