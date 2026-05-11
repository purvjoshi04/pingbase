import { Hono } from "hono";
import { prisma } from "@pingbase/store";

const websiteRouter = new Hono();

websiteRouter.post("/", async (c) => {
    const body = await c.req.json();
    const website = await prisma.website.create({
        data: {
            url: body.url,
            timeAdded: new Date()
        }
    });

    return c.json({
        id: website.id
    })
});

websiteRouter.get("/status/:websiteId", (c) => {
    return c.text("Get websites");
});

export default websiteRouter;