import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createExpense,
  deleteExpense,
  expenseBycategory,
  getAllExpense,
  upadteExpense,
} from "../controllers/expenses.controller";
import { createExpnese } from "../validators/expense.validator";
import { validate } from "../middlewares/validate";
const router = Router();

router
  .route("/createExpense")
  .post(authMiddleware, validate(createExpnese), createExpense);
router.route("/expnenseBycategory").get(authMiddleware, expenseBycategory);
router.route("/").get(authMiddleware, getAllExpense);
router.route("/deleteExpense").delete(authMiddleware, deleteExpense);
router.route("/updateExpense").patch(authMiddleware, upadteExpense);

export default router;
