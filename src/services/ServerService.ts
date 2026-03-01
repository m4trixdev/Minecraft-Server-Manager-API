import { execFile } from 'child_process';
import { promisify } from 'util';
import { executeRcon } from '../utils/rcon';
import { CommandLogRepository } from '../repositories/CommandLogRepository';
import { ServerStatus } from '../types';
import logger from '../utils/logger';

const execFileAsync = promisify(execFile);

export class ServerService {
    private logRepo: CommandLogRepository;

    constructor() {
        this.logRepo = new CommandLogRepository();
    }

    async getStatus(): Promise<ServerStatus> {
        try {
            const listOutput = await executeRcon('list');
            const match = listOutput.match(/There are (\d+) of a max of (\d+) players online/);
            const playerCount = match ? parseInt(match[1]) : 0;
            const maxPlayers = match ? parseInt(match[2]) : 0;

            const playersMatch = listOutput.match(/online: (.+)$/);
            const players = playersMatch ? playersMatch[1].split(', ').filter(Boolean) : [];

            return {
                online: true,
                players,
                playerCount,
                maxPlayers,
                version: process.env.SERVER_VERSION || 'unknown',
                uptime: null,
            };
        } catch {
            return {
                online: false,
                players: [],
                playerCount: 0,
                maxPlayers: 0,
                version: 'unknown',
                uptime: null,
            };
        }
    }

    async executeCommand(userId: string, command: string) {
        const sanitized = this.sanitizeCommand(command);
        if (!sanitized) throw new Error('Invalid command');

        let output = '';
        let status: 'SUCCESS' | 'ERROR' = 'SUCCESS';

        try {
            output = await executeRcon(sanitized);
        } catch (err) {
            status = 'ERROR';
            output = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Command failed', { command: sanitized, error: output });
        }

        const log = await this.logRepo.create(userId, sanitized, output, status);
        return { command: sanitized, output, status, executedAt: log.createdAt };
    }

    async getLogs(page: number, size: number) {
        return this.logRepo.findPaginated(page, size);
    }

    private sanitizeCommand(command: string): string {
        return command.trim().replace(/[;&|`$()]/g, '');
    }
}
