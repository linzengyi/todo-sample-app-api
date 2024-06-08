import { Router } from "express";

import { authLogin, authLogout, refreshToken  } from "../controllers/authController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *    name: Auth
 *    description: ##授權API 登入、登出、token更新
 */

// @Route   /auth/login
router.post('/login', authLogin);

// @Route   /auth/logout
router.delete('/logout', authLogout);

// @Route   /auth/token
router.post('/token', refreshToken);

export default router;