// This runs before each test
jest.mock("../config/db", () => {
  const prismaMock = require("../__mocks__/prisma").default;
  return { __esModule: true, default: prismaMock };
});
beforeEach(() => {
  jest.clearAllMocks();
});
