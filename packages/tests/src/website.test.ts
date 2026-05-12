import { describe, it, expect } from "bun:test";
import { app } from "@pingbase/api";

describe("Website", () => {
    it("should not create website if url is not present", async () => {
        const res = await app.request("/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(res.status).toBe(400);
    });

    it("should create website if url is present", async () => {
        const res = await app.request("/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://google.com" }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).not.toBeNull();
    });
});