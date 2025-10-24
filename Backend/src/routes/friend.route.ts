import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  sentRequest,
  acceptFriendRequest,
  allPendingRequests,
  blockFriendRequest,
  rejectFriendRequest,
  allFriends,
  countPendingRequest,
} from "../controllers/friend.controller";

const router = Router();

router.route("/create/:receiverId").post(authMiddleware, sentRequest);
router.route("/accept/:requesterId").post(authMiddleware, acceptFriendRequest);
router.route("/pendingrequets").get(authMiddleware, allPendingRequests);
router.route("/blockrequest").post(authMiddleware, blockFriendRequest);
router.route("/rejectRequest").post(authMiddleware, rejectFriendRequest);
router.route("/allFreinds").get(authMiddleware, allFriends);
router.route("/countrequests").get(authMiddleware, countPendingRequest);
export default router;
