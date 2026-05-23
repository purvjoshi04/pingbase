import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "@pingbase/api";
import { setupTestUser, getTestToken } from "./helpers/auth";

describe("Website", () => {
    let token: string, websiteId: string;

    beforeAll(async () => {
        await setupTestUser();
        token = await getTestToken();
    });

    it("should not create website without auth", async () => {
        const res = await app.request("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://google.com" }),
        });
        expect(res.status).toBe(401);
    });

    it("should not create website if url is missing", async () => {
        const res = await app.request("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        });
        expect(res.status).toBe(400);
    });

    it("should create website", async () => {
        const res = await app.request("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ url: "https://google.com" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBeDefined();
        websiteId = data.id;
    });

    it("should fetch website", async () => {
        const res = await app.request(`/status/${websiteId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.website.id).toBe(websiteId);
    });

    it("should be able to get all websites", async () => {
        const res = await app.request("/websites", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toContain("application/json");

        const data = await res.json();

        expect(data).toHaveProperty("websites");
        expect(Array.isArray(data.websites)).toBe(true);
        expect(data.websites.length).toBeGreaterThan(0);
        expect(
            data.websites.some((w: any) => w.id === websiteId)
        ).toBe(true);
    });
});