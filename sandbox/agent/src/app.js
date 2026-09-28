import express from "express";
import morgan from "morgan";
import fileRouter from "./routes/fileRoutes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api", fileRouter);


export default app;