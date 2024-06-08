import * as database from '../service/database.js';

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
 *     TodoResponse:
 *       type: object
 *       properties:
 *         rows: 
 *           type: array
 *           description: todo資料集合
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 使用者ID
 *               title: 
 *                 type: string
 *                 description: 待辦標題
 *               isCompleted:
 *                 type: boolean
 *                 description: 已完成
 *               is_delete:
 *                 type: boolean
 *                 description: 已刪除
 *         rowsTotal:
 *           type: number
 *           description: 總筆數
 *     TodoData:
 *       type: object
 *       required:
 *         - title 
 *       properties:
 *         title: 
 *           type: string
 *           description: 待辦內容
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     tags: 
 *       - Todos
 *     summary: 取得todo列表
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *     responses:
 *       200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TodoResponse'
 *       401:
 *         description: 需要授權token
 *       500:
 *         description: server 執行錯誤
 */


export const getTodos = async (req, res) => {
    try {
        const userId = (req.user && req.user.id) || -1;

        if (userId < 0) {
            return res.status(401).json({ message: '需要授權token'});
        }

        const limit = req.query.limit < 0 ? 15 : req.query.limit || 15;
        const page = req.query.page || 1;

        const result = await database.pool.query({
            text:  `select * from todos where user_id = $1 and is_delete = false order by created_date desc limit ${limit} offset ${(page-1)*limit}`,
            values: [userId]
        });

        const result2 = await database.pool.query({
            text:  `select count(*) as total from todos where user_id = $1 and is_delete = false`,
            values: [userId]
        });

        res.status(200).json({
            rows: result.rows,
            rowsTotal: result2.rows[0].total
        });

    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 新增Todo
 *     tags: 
 *       - Todos
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoData'
 *     responses:
 *       201:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 索引
 *                 title: 
 *                   type: string
 *                   description: 待辦標題
 *                 isCompleted:
 *                   type: boolean
 *                   description: 已完成
 *                 is_delete:
 *                   type: boolean
 *                   description: 已刪除
 *       401:
 *         description: 需要授權token
 *       422:
 *         description: 參數 title 必需
 *       500:
 *         description: server 執行錯誤
 */

export const createTodo = async (req, res) => {
    const userId = (req.user && req.user.id) || -1;

    if (userId < 0) {
      return res.status(401).json({ message: "需要授權token" });
    }

    const { title } = req.body;

    if (!title) {
      res.status(422).json({ message: "參數 title 必需" });
    }

    try {
        const result = await database.pool.query({
            text: `
                insert into todos(title, user_id) values ($1, $2) returning * 
            `,
            values: [title, userId]
        });

        res.status(201).json(result.rows[0]);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /api/todos/{todoId}:
 *   put:
 *     summary: 更新Todo
 *     tags: 
 *       - Todos
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *       - name: todoId
 *         in: path
 *         description: 來源todo資料欄位id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 調整todo標題內容
 *               is_completed:
 *                 type: boolean
 *                 description: 是否完成
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
 *                    description: 索引
 *                  title: 
 *                    type: string
 *                    description: 待辦標題
 *                  is_completed:
 *                    type: boolean
 *                    description: 已完成
 *                  is_delete:
 *                    type: boolean
 *                    description: 已刪除
 *       401:
 *          description: 需要授權token
 *       422:
 *         description: 需擇一提供 title 或 is_completed更新資料
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
 * 
 */

export const updateTodo = async (req, res) => {
    const userId = (req.user && req.user.id) || -1;

    if (userId < 0) {
      return res.status(401).json({ message: "需要授權token" });
    }

    const { todoId } = req.params;
    const { title, is_completed } = req.body;

    let assignUpdateFiled = false; 

    try {
        let result = null;
        
        if (title !== undefined) {
            assignUpdateFiled = true;
            
            result = await database.pool.query({
                text: `update todos set title=$1, updated_date=CURRENT_TIMESTAMP where id = $2 and user_id = $3 returning *`,
                values: [title, todoId, userId]
            });
        } 
        
        if (is_completed !== undefined) {
            assignUpdateFiled = true;

            result = await database.pool.query({
                text: `update todos set is_completed = $1, updated_date=CURRENT_TIMESTAMP where id = $2 and user_id = $3 returning *`,
                values: [is_completed, todoId, userId]
            });
        }
        
        if (!assignUpdateFiled) {
            return res.status(422).json({ message: '需擇一提供 title 或 is_completed更新資料'});
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: '資料不存在'});
        } else {
            res.status(200).json(result.rows[0]);
        }

    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /api/todos/{todoId}:
 *   delete:
 *     summary: 刪除Todo
 *     tags: 
 *       - Todos
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeader'
 *       - name: todoId
 *         in: path
 *         description: 來源todo紀錄欄位id.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *          description: 需要授權token
 *       404:
 *         description: 資料不存在
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

export const deleteTodo = async (req, res) => {
    const userId = (req.user && req.user.id) || -1;

    if (userId < 0) {
      return res.status(401).json({ message: "需要授權token" });
    }

    const { todoId } = req.params;

    try {

        const result = await database.pool.query({
            text: `update todos set is_delete=true, updated_date=CURRENT_TIMESTAMP where id = $1 and user_id = $2`,
            values: [todoId, userId]
        });

        if (result.rowCount === 0) {
            return res.status(404).json({ message: '資料不存在'});
        } 

        res.status(204).send();
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};