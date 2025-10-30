import request from "supertest";
import app from "../../app";
import prisma from "../../config/db";
import { signToken } from "../../utils/jwt";
describe("create expense api", () => {
  let token: string;
  beforeAll(async () => {
    //put demo user in db
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "securepass",
      },
    });
    token = signToken(user.id, user.username, user.email); // replace as needed
  });
  afterAll(async () => {
    await prisma.personalExpense.deleteMany();
    await prisma.user.deleteMany();
  });
  it("should create an expense successfully", async () => {
    const res = await request(app)
      .post("/u/expense/createExpense")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lunch",
        amount: 150,
        category: "FOOD",
        note: "Lunch with friends",
        date: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Lunch");
  });
});
