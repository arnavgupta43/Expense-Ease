import express from "express";
import userRoutes from "./routes/user.routes";
import router from "./routes/auth.route";
const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.use("/auth", router);
export default app;
