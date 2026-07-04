import { Hono } from "hono";
import { prisma } from "@pingbase/store";
import type { AppContext } from "../types";
import { authMiddleware } from "../middleware/auth";

const websiteRouter = new Hono<AppContext>();

websiteRouter.use(authMiddleware);

const VALID_INTERVALS = [60, 180, 300, 600];

websiteRouter.post("/", async (c) => {
    const { name, url, checkInterval } = await c.req.json();
    const userId = c.get("userId");

    if (!url) {
        return c.json({ error: "url is required" }, 400);
    }

    if (!name) return c.json({ error: "name is required" }, 400);

    if (!VALID_INTERVALS.includes(checkInterval)) {
        return c.json({ error: 'Invalid check interval' }, 400);
    }

    const website = await prisma.website.create({
        data: {
            name,
            url,
            user_id: userId,
            timeAdded: new Date(),
            checkInterval,
            nextCheckAt: new Date()
        }
    });

    return c.json({ id: website.id });
});

websiteRouter.get("/status/:websiteId", async (c) => {
    const userId = c.get("userId");
    const website = await prisma.website.findFirst({
        where: {
            user_id: userId,
            id: c.req.param('websiteId')
        },
        include: {
            ticks: {
                orderBy: [{ createdAt: "desc" }],
                take: 10
            }
        }
    });

    if (!website) {
        return c.json({ error: "Website not found" }, 404)
    } else {
        return c.json({
            website
        });
    }
});

websiteRouter.patch("/:websiteId", async (c) => {
    const userId = c.get("userId");
    const websiteId = c.req.param("websiteId");
    const body = await c.req.json();

    const website = await prisma.website.findFirst({
        where: {
            id: websiteId,
            user_id: userId
        }
    });

    if (!website) {
        return c.json({ error: "Website not found" }, 404);
    }

    if (body.checkInterval !== undefined && !VALID_INTERVALS.includes(body.checkInterval)) {
        return c.json({ error: "Invalid check interval" }, 400);
    }

    const updated = await prisma.website.update({
        where: { id: websiteId },
        data: {
            ...(body.name && { name: body.name }),
            ...(body.url && { url: body.url }),
            ...(body.checkInterval !== undefined && {
                checkInterval: body.checkInterval,
                nextCheckAt: new Date(),
            }),
        }
    });

    return c.json({ id: updated.id });
});

websiteRouter.delete("/:websiteId", async (c) => {
    const userId = c.get("userId");
    const websiteId = c.req.param("websiteId");

    const website = await prisma.website.findFirst({
        where: {
            id: websiteId,
            user_id: userId
        }
    });

    if (!website) {
        return c.json({ error: "Website not found" }, 404);
    }

    await prisma.website.delete({ where: { id: websiteId } });
    return c.json({ success: true });
});

websiteRouter.get("/", async (c) => {
    const userId = c.get("userId");
    const websites = await prisma.website.findMany({
        where: {
            user_id: userId
        },
        include: {
            ticks: {
                orderBy: [{ createdAt: "desc" }],
                take: 50
            }
        }
    });
    return c.json({ websites }, 200);
});


export default websiteRouter;