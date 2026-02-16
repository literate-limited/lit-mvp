import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, mockAuth } from "./setup";
import { POST } from "@/app/api/meet/route";
import { GET } from "@/app/api/meet/[code]/route";
import { NextRequest } from "next/server";

const user = { id: "u1", email: "test@test.com", name: "Test" };

describe("Meet API", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockPrisma.meetSession.create.mockReset();
    mockPrisma.meetSession.findUnique.mockReset();
  });

  it("POST /api/meet - creates session", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.meetSession.create.mockResolvedValue({
      id: "m1", code: "ABC123", ownerId: "u1", docId: null, expiresAt: new Date(), createdAt: new Date(),
    });
    const req = new NextRequest("http://localhost/api/meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.code).toBe("ABC123");
  });

  it("POST /api/meet - unauthorized", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/meet/[code] - returns session", async () => {
    mockPrisma.meetSession.findUnique.mockResolvedValue({
      id: "m1", code: "ABC123", ownerId: "u1", docId: null, expiresAt: new Date(), createdAt: new Date(),
      document: null,
    });
    const req = new NextRequest("http://localhost/api/meet/ABC123");
    const res = await GET(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(200);
  });

  it("GET /api/meet/[code] - 404", async () => {
    mockPrisma.meetSession.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/meet/BAD");
    const res = await GET(req, { params: Promise.resolve({ code: "BAD" }) });
    expect(res.status).toBe(404);
  });
});
