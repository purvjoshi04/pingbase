import { Hono } from "hono";

const websiteRouter = new Hono();

websiteRouter.post("/website", async (c) => {
    const body = await c.req.json();

    return c.json({
        message: "Website created",
        data: body,
    });
});

websiteRouter.get("/status/:websiteId", (c) => {
    return c.text("Get websites");
});

export default websiteRouter;