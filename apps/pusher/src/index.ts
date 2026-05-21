import { prisma } from "@pingbase/store";
import { xAddBulk } from "@pingbase/redis-stream/client";

async function main() {
    let websites = prisma.website.findMany({
        select: {
            url: true,
            id: true
        }
    });
    await xAddBulk((await websites).map(w => ({
        url: w.url,
        id: w.id
    })));
}

async function loop() {
    while (true) {
        await main();
        await Bun.sleep(3 * 1000 * 60);
    }
}

loop();