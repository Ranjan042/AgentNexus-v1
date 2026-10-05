import express from "express";
import morgan from "morgan";
import passport from "./config/passport.js";
import cookieParser from "cookie-parser";
import router from "./routes/authroutes.js";


const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());

// Routes
app.use("/api", router);




export default app;
