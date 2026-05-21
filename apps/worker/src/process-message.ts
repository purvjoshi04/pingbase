import { prisma } from '@pingbase/store';

export async function processMessage(
    message: Record<string, string>,
    regionId: string
) {
    const { url, id: websiteId } = message;
    if (!url || !websiteId) return;

    const startTime = Date.now();
    try {
        const res = await fetch(url);
        await prisma.websiteTick.create({
            data: {
                response_time_ms: Date.now() - startTime,
                status: res.ok ? 'Up' : 'Down',
                region_id: regionId,
                website_id: websiteId
            }
        });
    } catch {
        await prisma.websiteTick.create({
            data: {
                response_time_ms: Date.now() - startTime,
                status: 'Down',
                region_id: regionId,
                website_id: websiteId
            }
        });
    }
}