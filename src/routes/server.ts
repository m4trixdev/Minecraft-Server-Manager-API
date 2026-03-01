import { Router } from 'express';
import { z } from 'zod';
import { ServerController } from '../controllers/ServerController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();
const controller = new ServerController();

const commandSchema = z.object({
    command: z.string().min(1).max(256),
});

router.use(authenticate);

router.get('/status', (req, res) => controller.getStatus(req as any, res));
router.get('/logs', (req, res) => controller.getLogs(req as any, res));
router.post('/command', requireAdmin, validate(commandSchema), (req, res) =>
    controller.executeCommand(req as any, res)
);

export default router;
