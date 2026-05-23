import { Hono } from "hono";
import router from "./routes";

const app = new Hono();
app.route("/", router);

export { app };

if (process.env.NODE_ENV !== "test") {
    Bun.serve({
        port: Number(Bun.env.PORT) || 3001,
        fetch: app.fetch,
    });
    console.log(`Started server on port ${Bun.env.PORT || 3000}`);
}