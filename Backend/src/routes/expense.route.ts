import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createBill } from "../controllers/bill.controller";
import { createExpnese } from "../validators/expense.validator";
import { validate } from "../middlewares/validate";
const router = Router();

router
  .route("/createExpense")
  .post(authMiddleware, validate(createExpnese), createBill);

export default router;