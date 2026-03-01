import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();
const controller = new AuthController();

const loginSchema = z.object({
    username: z.string().min(3).max(64),
    password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
    role: z.enum(['user', 'admin']).optional().default('user'),
});

router.post('/login', validate(loginSchema), (req, res) => controller.login(req, res));
router.post('/register', authenticate, requireAdmin, validate(registerSchema), (req, res) =>
    controller.register(req, res)
);

export default router;
