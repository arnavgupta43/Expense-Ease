import bcrypt from "bcrypt";
const SALT = 10;
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};
