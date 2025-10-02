import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "erbjewbtrfjher";

export const signToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
