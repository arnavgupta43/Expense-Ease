import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBill,
  deleteBill,
  getBillCreate,
  getBills,
  settleBill,
  totalUnsettledAmount,
  viewBill,
} from "../controllers/bill.controller";
import { validate } from "../middlewares/validate";
import {
  validatecreateBill,
  upadteDeleteBill,
} from "../validators/bills.validator";
const router = Router();

router
  .route("/createBill")
  .post(validate(validatecreateBill), authMiddleware, createBill);

router
  .route("/deleteBill/:id")
  .delete(authMiddleware, validate(upadteDeleteBill), deleteBill);
router.route("/getbills").get(authMiddleware, getBills);
router.route("/getcreatedBills").get(authMiddleware, getBillCreate);
router
  .route("/settleBill/:id")
  .patch(authMiddleware, validate(upadteDeleteBill), settleBill);
router.route("/totalUnsettledAmount").get(authMiddleware, totalUnsettledAmount);
router.route("/viewBill/:id").get(authMiddleware, viewBill);
export default router;
