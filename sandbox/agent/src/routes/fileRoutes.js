import { Router } from "express";
import * as fileController from "../controllers/fileController.js";

const fileRouter = Router();


fileRouter.get("/", (req, res) => {
    res.send("Agent is running! :)");
});

fileRouter.get("/health", (req, res) => {
    res.send("Don't worry, I'm healthy Agent :)");
});

fileRouter.get("/listfiles", fileController.ListFiles);

fileRouter.get("/readfiles", fileController.ReadFiles);

fileRouter.patch("/updatefiles", fileController.UpdateFiles);

fileRouter.patch("/movefiles", fileController.MoveFiles);

fileRouter.delete("/deletefiles", fileController.DeleteFiles);

fileRouter.get("/search", fileController.SearchFiles);     

export default fileRouter;