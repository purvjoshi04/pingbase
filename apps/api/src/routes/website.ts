import { Hono } from "hono";
import { prisma } from "@pingbase/store";

const websiteRouter = new Hono();

websiteRouter.post("/", async (c) => {
    const body = await c.req.json();

    if (!body.url) {
        return c.json({ error: "url is required" }, 400);
    }

    const website = await prisma.website.create({
        data: { url: body.url, timeAdded: new Date() }
    });

    return c.json({ id: website.id });
});

websiteRouter.get("/status/:websiteId", (c) => {
    return c.text("Get websites");
});

export default websiteRouter;