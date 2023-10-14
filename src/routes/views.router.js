import {
    Router
} from 'express';

// Import Passport:
import passport from 'passport';

// Import Middleware Roles:
import {
    rolesVMiddlewareAdmin,
    rolesVMiddlewareUsers,
    rolesVMiddlewareAdminAndPremium
} from './Middlewares/rolesView.middleware.js'


const viewsRouter = Router();

viewsRouter.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registro'
    });
});

viewsRouter.get('/login', (req, res) => {
    res.render('login', {
        title: 'Iniciar Sesión'
    });
});

viewsRouter.get('/requestResetPassword', (req, res) => {
    res.render('requestResetPassword', {
        title: 'Restablecer Contraseña - Solicitar Correo'
    })
})

viewsRouter.get('/resetPasswordView', passport.authenticate('jwtResetPass', {
    session: false,
    failureRedirect: '/requestResetPassword'
}), (req, res) => {
    res.render('resetPassword', {
        title: 'Restablecer Contraseña'
    })
})

// Vistas para falta de autenticación (Vistas):

// Denegar el acceso a la vista a cualquier persona no logueada o con token vencido:
viewsRouter.get('/invalidToken', (req, res) => {
    res.render('invalidToken', {
        title: 'Acceso denegado - Token vencido'
    })
})

// Solo personas autentícadas:

viewsRouter.get('/products', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
    res.render('products', {
        title: 'Productos'
    })
});

viewsRouter.get('/chat', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
    res.render('chat', {
        title: 'Chat'
    })
});

viewsRouter.get('/perfil', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}),rolesVMiddlewareUsers, (req, res) => {
    res.render('profile', {
        title: 'Perfil'
    })
});

viewsRouter.get('/cart', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
    res.render('cart', {
        title: 'Carrito de Compras'
    });
});

viewsRouter.get('/changeRole', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
    res.render('changeRole', {
        title: 'Cambiar Role'
    })
})

viewsRouter.get('/completeProfile', (req, res) => {
    res.render('extraForm', {
        title: 'Formulario'
    })
});

// Solo admin: 

viewsRouter.get('/adminPanel', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareAdmin, (req, res) => {
    res.render('userAdmin', {
        title: 'Panel de administrador'
    })
})

// Solo admin y premium:

viewsRouter.get('/storeProducts', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesVMiddlewareAdminAndPremium, (req, res) => {
    res.render('store', {
        title: 'Publicar productos'
    })
})









export default viewsRouter;