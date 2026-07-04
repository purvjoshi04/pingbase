import { prisma } from "@pingbase/store";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { type AppContext, AuthInput } from "../types";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const userRouter = new Hono<AppContext>();

userRouter.post("/signup", async (c) => {
    const body = await c.req.json();

    const parsed = AuthInput.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: z.prettifyError(parsed.error) }, 400);
    }

    const { username, password } = parsed.data;

    const existing = await prisma.user.findFirst({ where: { username } });
    if (existing) {
        return c.json({ error: "Username already exists" }, 409);
    }

    const hashedPassword = await Bun.password.hash(password);
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword
        },
    });

    const token = await sign(
        { id: user.id },
        Bun.env.JWT_SECRET!
    );

    return c.json({ token })
});

userRouter.post("/signin", async (c) => {
    const body = await c.req.json();


    const parsed = AuthInput.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: z.prettifyError(parsed.error) }, 400);
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findFirst({
        where: { username }
    });

    if (!user) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    const validUser = await Bun.password.verify(password, user.password);

    if (!validUser) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await sign(
        { id: user.id },
        Bun.env.JWT_SECRET!
    );

    return c.json({ message: "Signed in successfully", token });
});

userRouter.get("/:userId/websites", async (c) => {
    return c.text("all websites")
});

userRouter.get("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
    });

    if (!user) {
        return c.json({
            error: "Username not found"
        }, 404);
    }

    return c.json({ user });
});

userRouter.patch("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const { username } = await c.req.json();

    if (!username?.trim()) {
        return c.json({
            error: "Username is required"
        }, 400)
    }

    const existing = await prisma.user.findFirst({
        where: { username: username.trim(), NOT: { id: userId } },
    });
    if (existing) {
        return c.json({ error: "Username already taken" }, 409);
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { username: username.trim() },
        select: { id: true, username: true }
    });

    return c.json({ user: updated });
});

userRouter.post("/change-password", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
        return c.json({ error: "Both current and new password are required" }, 400);
    }
    if (newPassword.length < 8) {
        return c.json({ error: "New password must be at least 8 characters" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ error: "User not found" }, 404);

    const valid = await Bun.password.verify(currentPassword, user.password);
    if (!valid) {
        return c.json({ error: "Current password is incorrect" }, 401);
    }

    const hashed = await Bun.password.hash(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });

    return c.json({ success: true });
});

export default userRouter;