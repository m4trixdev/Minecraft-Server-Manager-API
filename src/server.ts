import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import serverRouter from './routes/server';
import logger from './utils/logger';
import prisma from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT || '100', 10),
        message: { error: 'Too many requests' },
    })
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/server', serverRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
});

async function start() {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
}

start().catch((err) => {
    logger.error('Fatal startup error', { error: err.message });
    process.exit(1);
});
