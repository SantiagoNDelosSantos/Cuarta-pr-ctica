// github.passport.js:
import passport from 'passport';
import {
    Strategy as GitHubStrategy
} from 'passport-github2';

// Import SessionController:
import SessionController from '../controllers/sessionController.js';

// Import CartController:
import CartController from '../controllers/cartController.js';

// Importación de variables de entorno GitHub:
import {
    envClientID,
    envClientSecret,
    envCallbackURL
} from '../config.js';

// Instancia de SessionController: 
let sessionController = new SessionController();

// Instancia de CartController: 
let cartController = new CartController();

// Función de GitHub passport para expotarla:
export const initializePassportGitHub = (req, res, next) => {

    // Estrategia de registro con GitHub:
    passport.use('github', new GitHubStrategy({
        clientID: envClientID,
        clientSecret: envClientSecret,
        callbackURL: envCallbackURL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const session = profile._json.name;
            if (session) {
                return done(null, session);
            }
        } catch (error) {
            return done(null, false, {
                statusCode: 500,
                message: 'Error de registro en la autenticación por GitHub - gitHub.passport.js: ' + error.message
            });
        };
    }));

};

export const createBDSessionGH = async (req, res, next, session) => {
    let response = {};
    try {

        // Buscamos la session en la base de datos: 
        const existSessionControl = await sessionController.getSessionController(req, res, session);

        // Verificamos si no hubo algun error en el  módulo de session, si lo hubo devolvemos el mensaje de error:
        if (existSessionControl.statusCode === 500) {
            response.statusCode = 500;
            response.message = existSessionControl.message;
            return response;
        }

        // Verificamos si la session existe:
        if (existSessionControl.statusCode === 200) {

            // Si la cuenta existe, modificamos la propiedad last_connection de la session:
            const lastConnection = { last_connection: new Date().toLocaleDateString()  + " - " + new Date().toLocaleTimeString()}; 
            await sessionController.updateSessionController(req, res, next, existSessionControl.result._id.toString(), lastConnection);

            // Tambien devolvemos la session: 
            response.statusCode = 200;
            response.result = existSessionControl.result;
            return response;

        }

        // Si el usuario no esta registrado en la base de datos (404), entonces se procede a crear la session con los datos de GitHub: 
        else if (existSessionControl.statusCode === 404) {

            // Creamos un carrito para la session: 
            const resultCartControl = await cartController.createCartController(req, res);

            // Validamos si no hubo algun error en el  módulo de cart, si lo hubo devolvemos el mensaje de error:
            if (resultCartControl.statusCode === 500) {
                response.statusCode = 500;
                response.message = resultCartControl.message;
                return response;
            }

            // Si no hubo error en el módulo de cart continuamos con la creación de la session:
            if (resultCartControl.statusCode === 200) {

                // Extraemos solo el carrito creado por el cartController: 
                const cart = resultCartControl.result;

                // Creamos el objeto con los datos y le añadimos el _id de su carrito: 
                const newSession = {
                    first_name: session,
                    last_name: "X",
                    email: "X",
                    age: 0,
                    password: "Sin contraseña.",
                    role: "user",
                    cart: cart._id,
                };

                // Creamos la nueva session:
                const createSessionControl = await sessionController.createSessionControler(req, res, newSession);

                // Verificamos si no hubo algun error en el  módulo de session, si lo hubo devolvemos el mensaje de error:
                if (createSessionControl.statusCode === 500) {
                    response.statusCode = 500;
                    response.message = createSessionControl.message;
                    return response;
                }

                // Si no hubo error en el módulo de session:
                if (createSessionControl.statusCode === 200) {

                    // Modificamos la propiedad last_connection de la session:
                    const lastConnection = { last_connection: new Date().toLocaleDateString()  + " - " + new Date().toLocaleTimeString()};
                    await sessionController.updateSessionController(req, res, next, existSessionControl.result._id.toString(), lastConnection);
                    
                    // Tambien devolvemos la nueva session:
                    response.statusCode = 200;
                    response.result = createSessionControl.result;
                    return response;
                }

            }
        };
    } catch (error) {
        response.statusCode = 500;
        response.message = 'Error de registro en createBDSessionGH - github.passport.js: ' + error.message;
        req.logger.error(response.message);
        return response;
    };

};