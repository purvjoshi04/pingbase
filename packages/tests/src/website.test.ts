import { describe, it, expect } from "bun:test";
import { app } from "@pingbase/api";

describe("POST /websites", () => {
    it("should create a website", async () => {
        const res = await app.request("/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://google.com" }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.url).toBeDefined();
    });
});