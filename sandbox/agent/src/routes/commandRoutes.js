import {Router} from "express";
import { ExecuteCommand } from "../controllers/commandController.js";

const commandRouter = Router();


commandRouter.get("/", (req, res) => {
    res.send("Agent is running! :)");
});

commandRouter.post("/execute",ExecuteCommand);

export default commandRouter;