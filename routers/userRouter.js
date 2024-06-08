import { Router } from "express";

import { createUser, getUserInfo } from '../controllers/userController.js';

const router = Router();


/**
 * @swagger
 * tags:
 *    name: Users
 *    description: 使用者API 註冊、取得使用者資訊
*/

// @Route /users/register
router.post('/register', createUser);

// @Route /users/info
router.get('/info', getUserInfo);

export default router;