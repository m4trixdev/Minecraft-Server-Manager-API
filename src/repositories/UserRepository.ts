import prisma from '../utils/prisma';
import { User } from '@prisma/client';

export class UserRepository {
    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { username } });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async create(username: string, hashedPassword: string, role = 'user'): Promise<User> {
        return prisma.user.create({ data: { username, password: hashedPassword, role } });
    }

    async usernameExists(username: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
        return user !== null;
    }
}
