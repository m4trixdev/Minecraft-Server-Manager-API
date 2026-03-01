import { Response } from 'express';
import { ServerService } from '../services/ServerService';
import { AuthRequest } from '../types';

const serverService = new ServerService();

export class ServerController {
    async getStatus(_req: AuthRequest, res: Response): Promise<void> {
        const status = await serverService.getStatus();
        res.json(status);
    }

    async executeCommand(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await serverService.executeCommand(req.user!.id, req.body.command);
            res.json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Command failed';
            res.status(400).json({ error: message });
        }
    }

    async getLogs(req: AuthRequest, res: Response): Promise<void> {
        const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
        const size = Math.min(100, Math.max(1, parseInt(String(req.query.size ?? '20'))));
        const logs = await serverService.getLogs(page, size);
        res.json(logs);
    }
}
