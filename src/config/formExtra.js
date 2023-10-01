import jwt from 'jsonwebtoken';
import { envCoderSecret, envCoderTokenCookie, envCoderUserIDCookie } from '../config.js';

// Import createHash: 
import { createHash } from "../utils.js";

// Import SessionController:
import SessionController from '../controllers/sessionController.js';

// Instancia de SessionController: 
let sessionController = new SessionController();

// Function para completeProfile: 
export const completeProfile = async (req, res, next) => {

    // Obtenemos la cookie con el ID del "usuario base" creado con los datos de GitHub: 
    const sessionId = req.signedCookies[envCoderUserIDCookie]

    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = parseInt(req.body.age, 10);
    const password = createHash(req.body.password);

    try {

        // Crear el objeto con los datos del formulario extra, para actualizar al usuario creado con los datos de GitHub:
        const updateSession = {
            last_name,
            email,
            age,
            password
        };

        // Actualizar la session en la base de datos:
        const updateSessionControl = await sessionController.updateSessionController(req, res, next, sessionId, updateSession);

        // Si se encuEntra la session la actualizamos:
        if (updateSessionControl.statusCode === 200) {

            // Extraermos solo el resultado:
            const sessionExtraForm = updateSessionControl.result;

            // Generar el token JWT:
            let token = jwt.sign({
                email: sessionExtraForm.email,
                first_name: sessionExtraForm.first_name,
                role: sessionExtraForm.role,
                cart: sessionExtraForm.cart,
                userID: sessionExtraForm._id
            }, envCoderSecret, {
                expiresIn: '7d'
            });
            // Token jwt: 
            res.cookie(envCoderTokenCookie, token, {
                httpOnly: true,
                signed: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            // Redirigir al usuario a la vista de productos:
            res.send({
                status: 'success',
                redirectTo: '/products'
            });
            
        };
        
    } catch (error) {
        req.logger.error(error.message)
        return ('Error al completar datos de session creada con GitHub - formExtra.js: ' + error.message);
    };

};