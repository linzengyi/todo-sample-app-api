import { useValidate } from "validate-fields-body";
import bcrypt from "bcryptjs";

import * as database from "../service/database.js";


/**
 * @swagger
 * components:
 *   parameters:
 *     AuthorizationHeader:
 *       name: Authorization
 *       in: header
 *       required: true
 *       schema:
 *         type: string
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - accound 
 *         - password
 *         - name
 *       properties:
 *         accound: 
 *           type: string
 *           description: 帳號(格式:email)
 *         password:
 *           type: string
 *           description: 密碼
 *         name:
 *           type: string
 *           description: 使用者名稱
 */



/**
 * @swagger
 * /api/users/info:
 *   get:
 *     summary: 取得使用者資訊
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  id:
 *                    type: integer
 *                    description: 使用者ID
 *                  accound: 
 *                    type: string
 *                    description: 帳號(格式:email)
 *                  password:
 *                    type: string
 *                    description: 密碼
 *                  name:
 *                    type: string
 *                    description: 使用者名稱
 *       404:
 *         description: 使用者資料不存在
 *       500:
 *         description: 伺服器執行錯誤
 * 
 */


export const getUserInfo = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await database.pool.query({
            text: `select * from users where id = $1`,
            values: [userId]
        });

        if (result.rowCount === 0) {
            return res.status(404).json({ message: '使用者資料不存在'})
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 使用者帳號註冊
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  id:
 *                    type: integer
 *                    description: 使用者ID
 *                  accound: 
 *                    type: string
 *                    description: 帳號(格式:email)
 *                  password:
 *                    type: string
 *                    description: 密碼
 *                  name:
 *                    type: string
 *                    description: 使用者名稱
 *       400:
 *         description: 資料格式錯誤
 *       422:
 *         description: 缺少必要參數
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message: 
 *                    type: string
 *                    description: 異常訊息
 *       500:
 *         description: server 執行錯誤
 */

export const createUser = async (req, res) => {
    const { account, password, name } = req.body;

    if (!account || !password || !name) {
        return res.status(422).json({ message: '缺少必要參數' });
    }
    
    const fieldsValidate = ['account@'];

    const [InValid, logs] = useValidate(fieldsValidate, req.body);

    if (InValid) return res.status(400).json({ message: logs });

    try {
        
        const hashPassword = await bcrypt.hash(req.body.password, 8);

        const result = await database.pool.query({
            text: `insert into users(account, password, name) values($1, $2, $3) returning *`,
            values: [account, hashPassword, name]
        });

        return res.status(201).send(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


