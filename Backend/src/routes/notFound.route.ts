import { Router } from "express";
import { notFoundRoute } from "../controllers/notFoundController";
const router = Router();
router.route("").all(notFoundRoute);
export default router;
