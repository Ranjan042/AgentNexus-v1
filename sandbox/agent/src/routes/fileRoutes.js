import { Router } from "express";
import * as fileController from "../controllers/fileController.js";

const fileRouter = Router();


fileRouter.get("/listfiles", fileController.ListFiles);

fileRouter.get("/readfiles", fileController.ReadFiles);

fileRouter.patch("/updatefiles", fileController.UpdateFiles);

fileRouter.patch("/movefiles", fileController.MoveFiles);

fileRouter.delete("/deletefiles", fileController.DeleteFiles);

fileRouter.get("/search", fileController.SearchFiles);     

export default fileRouter;