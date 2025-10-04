import { Router } from "express";
import prisma from "../config/db"; //import the prisma client instance
import { authMiddleware } from "../middlewares/auth.middleware";
import { searchUser } from "../controllers/user.controller";
const router = Router();

//Search user for friend Request
router.route("/search").get(authMiddleware, searchUser);

export default router;
