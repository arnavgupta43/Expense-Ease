import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBill,
  deleteBill,
  getBillCreate,
  getBills,
  settleBill,
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
router.route("/getcreatedills").get(authMiddleware, getBillCreate);
router
  .route("/settleBill/:id")
  .post(authMiddleware, validate(upadteDeleteBill), settleBill);
export default router;
