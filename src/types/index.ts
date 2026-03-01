import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

export interface ServerStatus {
    online: boolean;
    players: string[];
    playerCount: number;
    maxPlayers: number;
    version: string;
    uptime: number | null;
}

export interface CommandResult {
    command: string;
    output: string;
    status: 'SUCCESS' | 'ERROR';
    executedAt: Date;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
