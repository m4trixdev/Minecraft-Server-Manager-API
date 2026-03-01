import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await authService.register(req.body.username, req.body.password, req.body.role);
            res.status(201).json(user);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            res.status(409).json({ error: message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.login(req.body.username, req.body.password);
            res.json(result);
        } catch (err) {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
}
