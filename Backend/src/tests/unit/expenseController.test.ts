import prisma from "../__mocks__/prisma";
jest.mock("../../config/db", () => ({ __esModule: true, default: prisma }));
import { createExpense } from "../../controllers/expenses.controller";
import httpMocks from "node-mocks-http";

describe("createExpense", () => {
  const userId = 1;
  it("it should return 400 if the userId is invalid", async () => {
    const req = httpMocks.createRequest({
      body: {},
      user: { id: "abc" },
    });
    const res = httpMocks.createResponse();
    await createExpense(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
  it("it should return 400 if amount<=0", async () => {
    const req = httpMocks.createRequest({
      body: {
        amount: 0,
        note: "demo",
        category: "OTHERS",
        title: "Movie",
      },
      user: { id: userId },
    });
    const res = httpMocks.createResponse();
    await createExpense(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Amount cannot be zero");
  });

  it("it should return 201 after creating the expense", async () => {
    const req = httpMocks.createRequest({
      body: {
        amount: 100,
        note: "demo",
        category: "OTHERS",
        title: "Movie",
        date: "2025-10-22",
      },
      user: { id: userId },
    });
    const fakeExpense = {
      id: 1,
      ...req.body,
      userId,
    };
    const res = httpMocks.createResponse();
    prisma.personalExpense.create.mockResolvedValue(fakeExpense);
    await createExpense(req, res);
    expect(prisma.personalExpense.create).toHaveBeenCalledWith({
      data: {
        ...req.body,
        userId,
        date: new Date("2025-10-22"),
      },
    });
    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData()).data).toEqual(fakeExpense);
  });
});
