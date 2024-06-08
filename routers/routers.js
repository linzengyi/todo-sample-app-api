import { Router } from "express";

import todoRouter from './todoRouter.js';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';

export const rootRouter = Router();

rootRouter.get('/version', (req, res) => {
    res.status(200).json({ version: '1.0.1' });
});

rootRouter.use('/api/auth', authRouter);
rootRouter.use('/api/users', userRouter);
rootRouter.use('/api/todos', todoRouter);
