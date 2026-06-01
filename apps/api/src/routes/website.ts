import { Hono } from "hono";
import { prisma } from "@pingbase/store";
import type { AppContext } from "../types";
import { authMiddleware } from "../middleware/auth";

const websiteRouter = new Hono<AppContext>();

websiteRouter.use(authMiddleware);

websiteRouter.post("/", async (c) => {
    const body = await c.req.json();
    const userId = c.get("userId");

    if (!body.url) {
        return c.json({ error: "url is required" }, 400);
    }

    if (!body.name) return c.json({ error: "name is required" }, 400);

    const website = await prisma.website.create({
        data: {
            name: body.name,
            url: body.url,
            timeAdded: new Date(),
            user_id: userId
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
})

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