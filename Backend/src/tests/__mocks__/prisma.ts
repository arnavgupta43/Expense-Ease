const mockUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
};
const mockPersonalExpense = {
  create: jest.fn(),
};
const mockFriend = {
  findUnique: jest.fn(),
  create: jest.fn(),
};
const prisma = {
  user: mockUser,
  personalExpense: mockPersonalExpense,
  friend: mockFriend,
};
export default prisma;
