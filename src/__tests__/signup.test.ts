import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma } from "./setup";
import { POST } from "@/app/api/auth/signup/route";
import { NextRequest } from "next/server";

function makeReq(body: object) {
  return new NextRequest("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
  });

  it("creates a user successfully", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "1", email: "test@test.com", name: "Test", role: "TEACHER",
    });

    const res = await POST(makeReq({ email: "test@test.com", password: "pass123", name: "Test" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe("test@test.com");
  });

  it("rejects missing fields", async () => {
    const res = await POST(makeReq({ email: "test@test.com" }));
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "1" });
    const res = await POST(makeReq({ email: "test@test.com", password: "pass", name: "Test" }));
    expect(res.status).toBe(409);
  });
});
