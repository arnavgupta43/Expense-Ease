import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createBill } from "../controllers/bill.controller";
import { validate } from "../middlewares/validate";
import { validatecreateBill } from "../validators/bills.validator";
const router = Router();

router
  .route("/createBill")
  .post(validate(validatecreateBill), authMiddleware, createBill);
export default router;
