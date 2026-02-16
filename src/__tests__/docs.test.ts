import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, mockAuth } from "./setup";
import { GET, POST } from "@/app/api/docs/route";
import { GET as GET_DOC, PUT, DELETE } from "@/app/api/docs/[id]/route";
import { NextRequest } from "next/server";

const user = { id: "u1", email: "test@test.com", name: "Test" };
const mockDoc = {
  id: "d1", ownerId: "u1", title: "Test Doc", pages: [], fromLanguage: "fr", toLanguage: "en",
  sharedToken: null, createdAt: new Date(), updatedAt: new Date(),
};

describe("Docs API", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockPrisma.document.findMany.mockReset();
    mockPrisma.document.findUnique.mockReset();
    mockPrisma.document.create.mockReset();
    mockPrisma.document.update.mockReset();
    mockPrisma.document.delete.mockReset();
  });

  it("GET /api/docs - unauthorized", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET /api/docs - lists docs", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.document.findMany.mockResolvedValue([mockDoc]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });

  it("POST /api/docs - creates doc", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.document.create.mockResolvedValue(mockDoc);
    const req = new NextRequest("http://localhost/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Doc" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("GET /api/docs/[id] - returns doc for owner", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.document.findUnique.mockResolvedValue(mockDoc);
    const req = new NextRequest("http://localhost/api/docs/d1");
    const res = await GET_DOC(req, { params: Promise.resolve({ id: "d1" }) });
    expect(res.status).toBe(200);
  });

  it("GET /api/docs/[id] - 404 for non-owner", async () => {
    mockAuth.mockResolvedValue({ user: { ...user, id: "other" } });
    mockPrisma.document.findUnique.mockResolvedValue(mockDoc);
    const req = new NextRequest("http://localhost/api/docs/d1");
    const res = await GET_DOC(req, { params: Promise.resolve({ id: "d1" }) });
    expect(res.status).toBe(404);
  });

  it("PUT /api/docs/[id] - updates doc", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.document.findUnique.mockResolvedValue(mockDoc);
    mockPrisma.document.update.mockResolvedValue({ ...mockDoc, title: "Updated" });
    const req = new NextRequest("http://localhost/api/docs/d1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "d1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("Updated");
  });

  it("DELETE /api/docs/[id] - deletes doc", async () => {
    mockAuth.mockResolvedValue({ user });
    mockPrisma.document.findUnique.mockResolvedValue(mockDoc);
    mockPrisma.document.delete.mockResolvedValue(mockDoc);
    const req = new NextRequest("http://localhost/api/docs/d1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "d1" }) });
    expect(res.status).toBe(200);
  });
});
