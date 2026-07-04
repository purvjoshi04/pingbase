import { xAckBulk, xReadGroup, ensureConsumerGroup } from "@pingbase/redis-stream/client";
import { processMessage } from "./process-message";
import { ensureRegion } from '@pingbase/store';

const region = await ensureRegion(process.env.REGION_NAME ?? 'default');
const WORKER_ID = Bun.env.WORKER_ID!;

if (!WORKER_ID) throw new Error("Worker id not provided");

await ensureConsumerGroup(region.id);

async function main() {
    while (true) {
        const messages = await xReadGroup(region.id, WORKER_ID);
        if (!messages) {
            await Bun.sleep(1000);
            continue;
        }

        const allMsgs = messages.flatMap(({ messages: msgs }) => msgs);

        await Promise.all(
            allMsgs.map(({ message }) => processMessage(message, region.id))
        );

        await xAckBulk(region.id, allMsgs.map(({ id }) => id));
    }
}

main();