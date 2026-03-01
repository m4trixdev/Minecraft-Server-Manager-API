import prisma from '../utils/prisma';
import { CommandLog } from '@prisma/client';
import { PaginatedResult } from '../types';

export class CommandLogRepository {
    async create(userId: string, command: string, output: string, status: string): Promise<CommandLog> {
        return prisma.commandLog.create({ data: { userId, command, output, status } });
    }

    async findPaginated(page: number, size: number): Promise<PaginatedResult<CommandLog>> {
        const skip = (page - 1) * size;
        const [items, total] = await prisma.$transaction([
            prisma.commandLog.findMany({
                skip,
                take: size,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } },
            }),
            prisma.commandLog.count(),
        ]);

        return {
            items,
            total,
            page,
            size,
            pages: Math.max(1, Math.ceil(total / size)),
        };
    }
}
