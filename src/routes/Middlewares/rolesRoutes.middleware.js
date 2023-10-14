// Estos middlewares de role son para regular el acceso a las rutas que no sean de vistas (Con res.send):

// Denegar la petición a cualquiera que no sea admin - Router:
export const rolesRMiddlewareAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: "Acceso denegado - Solo administradores",
            message: "La funcionalidad a la que intentas acceder es exclusiva para administradores y no está permitido su uso para usuarios regulares o premium. Por favor, inicia sesión con una cuenta de administrador.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

// Denegar la petición a cualquiera que no sea usuario regular o premium:
export const rolesRMiddlewareUsers = (req, res, next) => {
    if (req.user.role === 'user' || req.user.role === 'premium') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: "Acceso denegado - Solo usuarios",
            message: "La funcionalidad a la que intentas acceder es exclusiva para usuarios. Por favor, inicia sesión.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

// Denegar la petición a cualquiera que no sea admin o premium: 
export const rolesRMiddlewareAdminAndPremium = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'premium') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: 'Acceso denegado - Solo administradores y usuarios premium',
            message: "La funcionalidad a la que intentas acceder solo está disponible para usuarios premium y administradores. Por favor, inicia sesión con la cuenta correspondiente.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

// Denegar la petición a cualquier persona no autentícada: 
export const rolesRMiddlewarePublic = (req, res, next) => {
    if (req.user.role === 'user' || req.user.role === 'premium' || req.user.role === 'admin') {
        next();
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: 'Acceso denegado',
            message: " La funcionalidad a la que intentas acceder requiere autenticación. Por favor, crea una cuenta e inicia sesión.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

/* 



    // Current user - Router:
    sessionRouter.get('/current', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
    }), rolesRMiddlewarePublic, getCurrentUser);



    // Eliminar mensajes: 
    async function deleteMessage(messageId) {

    try {

        const response = await fetch(`/api/chat/${messageId}`, {
        method: 'DELETE',
        })

        if (response.redirected) {
        const invalidTokenURL = response.url;
        window.location.replace(invalidTokenURL);
        }
    
        const res = await response.json();
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.cause;

        if(statusCode === 401){
        Swal.fire({
            title: res.h1,
            text: res.message,
            imageUrl: res.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: res.h1,
        })
        } else if (statusCode === 200) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            title: message || 'El mensaje fue eliminado con éxito.',
            icon: 'success'
        });
        } 



































    const response = await fetch(`/api/chat/${messageId}`, {
        
        method: 'DELETE',
        })

        const res = await response.json();
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.cause;

        if(statusCode === 401){
        Swal.fire({
            title: res.h1,
            text: res.message,
            imageUrl: res.img,
            imageWidth: 70,
            imageHeight: 70,
            imageAlt: res.h1,
        })
        } else if (statusCode === 200) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            title: message || 'El mensaje fue eliminado con éxito.',
            icon: 'success'
        });
        }


*/