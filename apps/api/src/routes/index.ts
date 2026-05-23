import { Hono } from "hono";
import userRouter from "./user";
import websiteRouter from "./website";

const router = new Hono();

router.route("/user", userRouter);
router.route("/", websiteRouter);

export default router;