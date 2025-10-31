import prisma from "../__mocks__/prisma";
jest.mock("../../config/db", () => ({ __esModule: true, default: prisma }));
import httpMocks from "node-mocks-http";
import { sentRequest } from "../../controllers/friend.controller";

describe("friend request sent controller", () => {
  it("return a error when senderId is not a numnberS", async () => {
    const req = httpMocks.createRequest({
      body: {},
      user: { id: "abc" },
    });
    const res = httpMocks.createResponse();
    await sentRequest(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
  it("return a bad request when senderId is not a number", async () => {
    const req = httpMocks.createRequest({
      body: {},
      user: { id: 1 },
      params: { receiverId: "abc" },
    });
    const res = httpMocks.createResponse();
    await sentRequest(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe(
      "Receiver ID must be a valid number"
    );
  });
});
