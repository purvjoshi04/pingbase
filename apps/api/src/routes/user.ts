import { prisma } from "@pingbase/store";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { AuthInput } from "../types";
import { z } from "zod";

const userRouter = new Hono();

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

export default userRouter;