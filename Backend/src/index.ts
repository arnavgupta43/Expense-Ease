import express from "express";
import dotenv from "dotenv";
import app from "./app";
dotenv.config();
const PORT = process.env.PORT || 5000;
const server = express();
server.use(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
