import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "@pingbase/api";
import { setupTestUser, getTestToken } from "./helpers/auth";

describe("Website", () => {
    let token: string;

    beforeAll(async () => {
        await setupTestUser();
        token = await getTestToken();
    });

    it("should not create website without auth", async () => {
        const res = await app.request("/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://google.com" }),
        });
        expect(res.status).toBe(401);
    });

    it("should not create website if url is missing", async () => {
        const res = await app.request("/websites", {
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
        const res = await app.request("/websites", {
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
    });
});