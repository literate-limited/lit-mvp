import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma } from "./setup";
import { GET } from "@/app/api/docs/shared/[token]/route";
import { NextRequest } from "next/server";

describe("GET /api/docs/shared/[token]", () => {
  beforeEach(() => {
    mockPrisma.document.findUnique.mockReset();
  });

  it("returns shared doc", async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "d1", title: "Shared", pages: [], fromLanguage: "fr", toLanguage: "en", sharedToken: "tok1",
    });
    const req = new NextRequest("http://localhost/api/docs/shared/tok1");
    const res = await GET(req, { params: Promise.resolve({ token: "tok1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("Shared");
  });

  it("returns 404 for invalid token", async () => {
    mockPrisma.document.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/docs/shared/bad");
    const res = await GET(req, { params: Promise.resolve({ token: "bad" }) });
    expect(res.status).toBe(404);
  });
});
