import { Router } from "express";
import prisma from "../config/db"; //import the prisma client instance
const router = Router();

// Route to get all users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
export default router;
