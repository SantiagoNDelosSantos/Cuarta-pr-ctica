import {
    Router
} from 'express';
import passport from 'passport';

import {
    registerUser,
    loginUser,
    getCurrentUser,
    authenticateWithGitHub
} from './Middlewares/passport.middleware.js';

import {
    completeProfile
} from '../config/formExtra.js';

// Import SessionController
import SessionController from '../controllers/sessionController.js';

// Import Middleware User:
import {
    rolesMiddlewareUser
} from "./Middlewares/roles.middleware.js";
import {
    ProfileUserDTO
} from '../controllers/DTO/userProfile.dto.js';

// Import Multer Profile: 
import {
    uploaderPofiles
} from '../routes/Middlewares/multer.middleware.js'

// Instancia de router: 
const sessionRouter = Router();

// Instancia de SessionController: 
let sessionController = new SessionController();

// Register - Router:
sessionRouter.post('/register', registerUser);

// Login - Router:
sessionRouter.post('/login', loginUser);

// GitHub - Router:
sessionRouter.get('/github', passport.authenticate('github', {
    session: false,
    scope: 'user:email'
}));

sessionRouter.get('/githubcallback', authenticateWithGitHub);

// Formulario extra GitHub - Router:
sessionRouter.post('/completeProfile', completeProfile);

// Current user - Router:
sessionRouter.get('/current', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/login'
}), getCurrentUser);

// Ver perfil usuario - Router: 
sessionRouter.get('/profile', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/login'
}), async (req, res) => {
    const result = await sessionController.getUserController(req, res);
    const resultFilter = new ProfileUserDTO(result.result);
    let devolver
    if (resultFilter) {
        devolver = resultFilter
    } else {
        devolver = result
    }
    if (result !== undefined) {
        res.status(result.statusCode).send(devolver);
    }
});

// Enviar email para reestablecer contraseña - Router:
sessionRouter.post('/requestResetPassword', async (req, res, next) => {
    const result = await sessionController.getUserAndSendEmailController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Reestablecer contraseña de usuario - Router:
sessionRouter.post('/resetPassword', async (req, res, next) => {
    const result = await sessionController.resetPassUserController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Editar perfil - Router:
sessionRouter.post('/editProfile', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareUser, uploaderPofiles.single('profile'), async (req, res, next) => {
    const result = await sessionController.editProfileController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Cerrar session - Router:
sessionRouter.post('/logout', passport.authenticate('jwt', {
    session: false
}), async (req, res, next) => {
    const result = await sessionController.logoutController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Eliminar cuenta - Router:  
sessionRouter.post('/deleteAccount', passport.authenticate('jwt', {
        session: false
    }), rolesMiddlewareUser,
    async (req, res, next) => {
        const result = await sessionController.deleteUserController(req, res, next);
        if (result !== undefined) {
            res.status(result.statusCode).send(result);
        };
    }
);

export default sessionRouter;