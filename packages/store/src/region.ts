import { prisma } from './client';

export async function ensureRegion(name: string) {
    return prisma.region.upsert({
        where: { name },
        update: {},
        create: { name },
    });
}