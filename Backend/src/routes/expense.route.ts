import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createExpense,
  deleteExpense,
  expenseBycategory,
  getAllExpense,
  updateExpense,
} from "../controllers/expenses.controller";
import {
  createExpnese,
  getExpenseByCategory,
  updateValidator,
} from "../validators/expense.validator";
import { validate } from "../middlewares/validate";
const router = Router();

router
  .route("/createExpense")
  .post(authMiddleware, validate(createExpnese), createExpense);
router
  .route("/expnenseBycategory")
  .get(authMiddleware, validate(getExpenseByCategory), expenseBycategory);
router.route("/").get(authMiddleware, getAllExpense);
router.route("/deleteExpense/:id").delete(authMiddleware, deleteExpense);
router
  .route("/updateExpense")
  .patch(authMiddleware, validate(updateValidator), updateExpense);

export default router;
