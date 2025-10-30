const mockUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
};
const mockPersonalExpense = {
  create: jest.fn(),
};
const prisma = {
  user: mockUser,
  personalExpense: mockPersonalExpense,
};
export default prisma;
