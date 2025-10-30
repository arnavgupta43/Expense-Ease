import { execSync } from "child_process";
// Run before all tests
beforeAll(() => {
  execSync("dotenv -e .env.test -- npx prisma db push", { stdio: "inherit" });
});

beforeEach(() => {
  jest.clearAllMocks();
});
