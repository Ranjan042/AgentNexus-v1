import express from "express"
import morgan from "morgan"
import routes from "./routes/sandBoxRoute.js"

const app=express();

app.use(morgan("dev"));

app.use("/api/sandbox", routes);


export default app;
