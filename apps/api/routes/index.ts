import { Hono } from "hono";
import userRouter from "./user";
import websiteRouter from "./website";

const router = new Hono();

router.route("/users", userRouter);
router.route("websites", websiteRouter);

export default router;