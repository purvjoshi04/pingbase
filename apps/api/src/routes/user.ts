import { Hono } from "hono";

const userRouter = new Hono();

userRouter.get("/:userId/websites", async (c)=> {
    return c.text("all websites")
});

export default userRouter;