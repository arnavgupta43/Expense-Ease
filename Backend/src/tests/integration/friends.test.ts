import app from "../../app";
import prisma from "../../config/db";
import { signToken } from "../../utils/jwt";
import request from "supertest";
describe("create a friend", () => {
  let token: string;
  let user1Id: number;
  let user2Id: number;
  beforeAll(async () => {
    const user1 = await prisma.user.create({
      data: {
        name: "Test User1",
        username: "testuser1",
        email: "test@example2.com",
        password: "securepass",
      },
    });
    const user2 = await prisma.user.create({
      data: {
        name: "Test User2",
        username: "testuser2",
        email: "test@example1.com",
        password: "securepass",
      },
    });
    token = signToken(user1.id, user1.username, user1.email);
    user2Id = user2.id;
  });
  afterAll(async () => {
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });
  it("should throw an error with invlaid receiverId", async () => {
    const res = await request(app)
      .post(`/friend/create/${user2Id + 1}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Receiver does not exits");
  });

  it("should sent the friend request successfully", async () => {
    const res = await request(app)
      .post(`/friend/create/${user2Id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Friend Request Sent");
  });
});
