import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "erbjewbtrfjher";

export const signToken = (userId: number, username: string, email: string) => {
  return jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: "7d" });
};
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
