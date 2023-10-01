import { Router } from 'express';

// Import UserController: 
import UserController from '../controllers/userController.js'

// Instancia de router: 
const userRouter = Router();

// Instancia de UserController: 
let userController = new UserController();

// Cambiar rol del usuario: 
userRouter.post('/premium/:uid', async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default userRouter;