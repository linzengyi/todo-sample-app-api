import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import * as database from '../service/database.js';
import { TOKEN_TYPE, generateToken } from '../service/toekn.js';


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
 *     LoginInput:
 *       type: object
 *       required:
 *         - accound 
 *         - password
 *       properties:
 *         accound: 
 *           type: string
 *           description: 帳號(格式:email)
 *           default: xxxx@gmail.com
 *         password:
 *           type: string
 *           description: 密碼
 *           default: 123456
 *     LoginOrRefreshResponse:
 *       type: object
 *       properties:
 *         accessToken: 
 *            type: string
 *            description: API授權token
 *         refreshToken:
 *            type: string
 *            description: 更新API授權token
 */

/**
 * @swagger
 *  /api/auth/login:
 *    post:
 *      tags: 
 *        - Auth
 *      summary: 登入
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginInput'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/LoginOrRefreshResponse'  
 *        401:
 *          description: 缺少必要參數，account 或 password
 *        403:
 *          description: 密碼錯誤!
 *        404:
 *          description: 帳號不存在
 *        500:
 *          description: server 執行錯誤
 */

export const authLogin = async (req, res) => {
    const { account, password } = req.body;

    try {
      if (!account || !password) {
        return res.status(401).json({ message: "缺少必要參數" });
      }

      // 查詢User
      const result = await database.pool.query({
        text: "select * from users where account = $1",
        values: [account],
      });

      const userData = result.rows[0];

      if (!userData) {
        return res.status(404).json({ message: "帳號不存在!" });
      }

      const isSame = await bcrypt.compare(password, userData.password);

      if (!isSame) {
        return res.status(403).json({ message: "密碼錯誤!" });
      }

      const accessToken = generateToken(TOKEN_TYPE.ACCESS_TOKEN, {
        id: userData.id,
        name: userData.name,
      });

      const refreshToken = generateToken(TOKEN_TYPE.REFRESH_TOKEN, {
        id: userData.id,
        name: userData.name,
      });

      await database.pool.query({
        text: `INSERT INTO tokens(access_token, refresh_token, user_id) values ($1, $2, $3)`,
        values: [accessToken, refreshToken, userData.id]
      });

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: 
 *       - Auth
 *     summary: 登出
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *     responses:
 *       200:
 *         description: OK 已登出
 *       401:
 *         description: 需提供token
 *       500:
 *         description: server 執行錯誤
 */

export const authLogout = async (req, res) => {
    const authorization = req.headers['authorization'];

    const token = authorization && authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '需提供token' });
    }

    let result;
    
    try {
      if (req.user) {
        result = await database.pool.query({
          text: `UPDATE tokens SET state='F', updated_date=CURRENT_TIMESTAMP 
              WHERE user_id=$1 and access_token=$2`,
          values: [req.user.id, token]
        });
      } else {
        result = await database.pool.query({
          text: `UPDATE tokens SET state='F', updated_date=CURRENT_TIMESTAMP 
              WHERE access_token=$1`,
          values: [token]
        });
      }
  
      if (result.rowCount > 0) {
        res.status(200).json({ message: '已登出' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: token更新
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginOrRefreshResponse'
 *       401:
 *         description: 需提供refresh_token
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

export const refreshToken = async (req, res) => {

    const authorization = req.headers['authorization'];

    const refreshToken = authorization && authorization.split(' ')[1];

    if (!refreshToken) {
      return res.status(401).json({ message: '需提供refresh_token' });
    }
   
    let user;
    let accessToken;
    try {
      const { id, name } = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      user = { id, name };

      // 找出傳入refreshToken目前有效accessToken，將狀態更新無效
      await database.pool.query({
        text: `UPDATE tokens SET state='F', updated_date=CURRENT_TIMESTAMP 
          WHERE state is null and user_id=$1 and refresh_token=$2`,
        values: [user.id, refreshToken],
      });

      accessToken = generateToken(TOKEN_TYPE.ACCESS_TOKEN, user);

      await database.pool.query({
        text: `INSERT INTO tokens(access_token, refresh_token, user_id) values ($1, $2, $3)`,
        values: [accessToken, refreshToken, user.id]
      });

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      // 找出傳入refreshToken目前有效accessToken，將狀態更新無效
      await database.pool.query({
        text: `UPDATE tokens SET state='F', updated_date=CURRENT_TIMESTAMP 
        WHERE state is null and refresh_token=$1`,
        values: [refreshToken],
      });

      return res.status(500).json({ message: error.message });
    }
};
