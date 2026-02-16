import { describe, it, expect, beforeEach } from "vitest";
import { mockAuth } from "./setup";
import { POST } from "@/app/api/translate/route";
import { NextRequest } from "next/server";

const user = { id: "u1", email: "test@test.com", name: "Test" };

describe("POST /api/translate", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("translates text", async () => {
    mockAuth.mockResolvedValue({ user });
    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Bonjour", from: "fr", to: "en" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translation).toBe("Hello translated");
  });

  it("rejects unauthorized", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Bonjour" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects missing text", async () => {
    mockAuth.mockResolvedValue({ user });
    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
