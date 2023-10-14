import {
    Router
} from 'express';

import passport from 'passport';

// Import UserController: 
import UserController from '../controllers/userController.js'

// Import Middleware User:
import {
    rolesMiddlewareUsers,
    rolesMiddlewareAdmin,
    rolesMiddlewarePublic 
} from "./Middlewares/roles.middleware.js";

// Import Multer Documents:
import {
    uploaderDocuments
} from './Middlewares/multer.middleware.js'

// Instancia de router: 
const userRouter = Router();

// Instancia de UserController: 
let userController = new UserController();

// Subir documentación de usuario - Router:
userRouter.post('/:uid/documents', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareUsers, uploaderDocuments.fields([{
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
}),  rolesMiddlewarePublic, async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Obtener todos los usuarios - Router: 
userRouter.get('/allUsers', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareAdmin, async (req, res) => {
    const result = await userController.getAllUsersController(req, res);
    res.status(result.statusCode).send(result);
});

// Eliminar usuarios inactivos (2 Días) - Router:
userRouter.delete('/deleteInactivityUsers', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareAdmin, async (req, res) => {
    const result = await userController.deleteInactivityUsersController(req, res);
    res.status(result.statusCode).send(result);
});







// Crear una vista que permita visualizar, modificar el rol y eliminar un usuario. Esta vista solo debe ser accesible por el admin.




// Finalizar las vista necesarias para el proceso de compra. 

// Realizar el despliegue de la aplicación en Railway.app y corroborar que se puede llevar a cabo un proceso de compra completo.  



export default userRouter;