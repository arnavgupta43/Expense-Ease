import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sentRequest } from "../controllers/friend.controller";

const router = Router();

router.route("/create/:receiverId").post(authMiddleware, sentRequest);
export default router;
