import { Router } from "express";
import { getTodos, 
         createTodo, 
         updateTodo, 
         deleteTodo 
       } from '../controllers/todoController.js'

const router = Router();

/**
 * @swagger
 * tags:
 *    name: Todos
 *    description: Todo CRUD API
 */

// @Route GET /todos
router.get('/', getTodos);

// @Route POST /todos
router.post('/', createTodo);

// @Route PUT /todos/:id
router.put('/:todoId', updateTodo);

// @Route DELETE /todos/:id
router.delete('/:todoId', deleteTodo);

export default router;