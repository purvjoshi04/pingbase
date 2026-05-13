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

    const website = await prisma.website.create({
        data: { url: body.url, timeAdded: new Date(), user_id: userId }
    });

    return c.json({ id: website.id });
});

websiteRouter.get("/status/:websiteId", (c) => {
    return c.text("Get websites");
});

export default websiteRouter;