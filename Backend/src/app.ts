import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes";
import router from "./routes/auth.route";
import friendRouter from "./routes/friend.route";
import expenseRouter from "./routes/expense.route";
import billrouter from "./routes/bills.route";
import { notFoundRoute } from "./controllers/notFoundController";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
const app = express();
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use("/users", userRoutes);
app.use("/auth", router);
app.use("/friend", friendRouter);
app.use("/u/expense", expenseRouter);
app.use("/u/bills", billrouter);
app.use(notFoundRoute);
export default app;
