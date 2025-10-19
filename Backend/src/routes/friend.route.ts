import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  sentRequest,
  acceptFriendRequest,
  allPendingRequests,
} from "../controllers/friend.controller";

const router = Router();

router.route("/create/:receiverId").post(authMiddleware, sentRequest);
router.route("/accept/:requesterId").post(authMiddleware, acceptFriendRequest);
router.route("/pendingrequets").get(authMiddleware, allPendingRequests);
export default router;
