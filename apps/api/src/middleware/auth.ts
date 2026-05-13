import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return c.json({ error: "Unauthorized" }, 401)
    }

    try {
        const payload = await verify(token, Bun.env.JWT_SECRET!, "HS256");
        c.set("userId", payload.id);
        await next();
    } catch {
        return c.json({ error: "Invalid token" }, 401);
    }
});