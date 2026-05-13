import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "@pingbase/api";
import { setupTestUser } from "./helpers/auth";

describe("User", () => {
    beforeAll(async () => {
        await setupTestUser();
    });

    it("should signup", async () => {
        const res = await app.request("/user/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "newuser", password: "test123" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.token).toBeDefined();
    });

    it("should signin", async () => {
        const res = await app.request("/user/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "newuser", password: "test123" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.token).toBeDefined();
    });

    it("should fail signin with wrong password", async () => {
        const res = await app.request("/user/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "newuser", password: "wrongpass" }),
        });
        expect(res.status).toBe(401);
    });
});