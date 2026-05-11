import { Hono } from "hono";
import router from "./routes";

const app = new Hono();

app.route("/", router);

export default {
    port: Bun.env.PORT || 3000,
    fetch: app.fetch,
};