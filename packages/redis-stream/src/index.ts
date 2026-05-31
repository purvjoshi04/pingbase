import { createClient } from 'redis';

const client = createClient()
    .on('error', err => console.log('Redis Client Error', err));

await client.connect();

const STREAM_NAME = Bun.env.STREAM_NAME!;
const GROUP_NAME = Bun.env.REGION_ID!;
type WebsiteEvent = { url: string; id: string };

type StreamMessage = {
    name: string;
    messages: {
        id: string;
        message: Record<string, string>;
    }[];
}

export type { StreamMessage };


async function ensureGroup() {
    try {
        await client.xGroupCreate(STREAM_NAME, GROUP_NAME, "0", {
            MKSTREAM: true,
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("BUSYGROUP")) return;
        throw err;
    }
}

await ensureGroup();

export async function ensureConsumerGroup(groupName: string) {
    try {
        await client.xGroupCreate(Bun.env.STREAM_NAME!, groupName, "0", {
            MKSTREAM: true,
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("BUSYGROUP")) return;
        throw err;
    }
}

async function xAdd({ url, id }: WebsiteEvent) {
    await client.xAdd(
        Bun.env.STREAM_NAME!, '*', {
        url,
        id,
    }
    );
}

export async function xAddBulk(websites: WebsiteEvent[]) {
    const pipeline = client.multi();

    for (const { url, id } of websites) {
        pipeline.xAdd(Bun.env.STREAM_NAME!, '*', { url, id });
    }

    await pipeline.exec();
}

export async function xReadGroup(consumerGroup: string, workerId: string): Promise<StreamMessage[] | null> {
    const res = await client.xReadGroup(
        consumerGroup,
        workerId,
        { key: Bun.env.STREAM_NAME!, id: '>' },
        { COUNT: 5 }
    );
    return res as unknown as StreamMessage[] | null;
}

async function xAck(consumerGroup: string, eventId: string) {
    await client.xAck(Bun.env.STREAM_NAME!, consumerGroup, eventId);
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    const pipeline = client.multi();
    for (const id of eventIds) {
        pipeline.xAck(Bun.env.STREAM_NAME!, consumerGroup, id);
    }
    await pipeline.exec();
}