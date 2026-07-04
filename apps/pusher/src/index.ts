import { prisma } from "@pingbase/store";
import { xAddBulk } from "@pingbase/redis-stream/client";

const POLL_INTERVAL_MS = 30_000;

async function pushDueWebsites() {
    const now = new Date();

    const dueWebsites = await prisma.website.findMany({
        where: { nextCheckAt: { lte: now } },
    });

    if (dueWebsites.length === 0) return;

    await xAddBulk(
        dueWebsites.map((w) => ({ url: w.url, id: w.id }))
    );

    await Promise.all(
        dueWebsites.map((w) =>
            prisma.website.update({
                where: { id: w.id },
                data: {
                    lastCheckedAt: now,
                    nextCheckAt: new Date(now.getTime() + w.checkInterval * 1000),
                },
            })
        )
    );
}

async function loop() {
    while (true) {
        try {
            await pushDueWebsites();
        } catch (err) {
            console.error("Pusher cycle failed:", err);
        }
        await Bun.sleep(POLL_INTERVAL_MS);
    }
}

loop();