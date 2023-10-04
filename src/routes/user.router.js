import {
    Router
} from 'express';

import passport from 'passport';

// Import UserController: 
import UserController from '../controllers/userController.js'

// Import Middleware User:
import {
    rolesMiddlewareUser
} from "./Middlewares/roles.middleware.js";

// Import Multer:
import {
    uploaderDocuments
} from './Middlewares/multer.middleware.js'

// Instancia de router: 
const userRouter = Router();

// Instancia de UserController: 
let userController = new UserController();

// Subir documentación de usuario - Router:
userRouter.post('/:uid/documents',  passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareUser, uploaderDocuments.fields([{
        name: 'identification',
        maxCount: 1
    },
    {
        name: 'proofOfAddress',
        maxCount: 1
    },
    {
        name: 'bankStatement',
        maxCount: 1
    }
]), async (req, res, next) => {
        const result = await userController.uploadPremiumDocsController(req, res, next);
        if (result !== undefined) {
            res.status(result.statusCode).send(result);
        };
});

// Cambiar rol del usuario - Router: 
userRouter.post('/premium/:uid', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareUser, async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default userRouter;