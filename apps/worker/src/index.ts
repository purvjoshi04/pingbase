import { xAckBulk, xReadGroup } from '@pingbase/redis-stream/client';
import { processMessage } from './process-message';

const REGION_ID = Bun.env.REGION_ID!;
const WORKER_ID = Bun.env.WORKER_ID!;

if (!REGION_ID) throw new Error('Region id not provided');
if (!WORKER_ID) throw new Error('Worker id not provided');


async function main() {
    while (true) {
        const messages = await xReadGroup(REGION_ID, WORKER_ID);
        if (!messages) {
            await Bun.sleep(1000);
            continue;
        }

        const allMsgs = messages.flatMap(({ messages: msgs }) => msgs);

        await Promise.all(
            allMsgs.map(({ message }) => processMessage(message, REGION_ID))
        );

        await xAckBulk(REGION_ID, allMsgs.map(({ id }) => id));
    }
}

main();