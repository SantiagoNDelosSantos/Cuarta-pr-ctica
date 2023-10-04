import jwt from 'jsonwebtoken';
import {
    envCoderSecret,
    envCoderTokenCookie,
    envCoderUserIDCookie
} from '../config.js';

// Import createHash: 
import {
    createHash
} from "../utils.js";

// Import SessionController:
import SessionController from '../controllers/sessionController.js';

// Errores:
import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

// Instancia de SessionController: 
let sessionController = new SessionController();

// Function para completeProfile: 
export const completeProfile = async (req, res, next) => {

    // Obtenemos la cookie con el ID del "usuario base" creado con los datos de GitHub: 
    const userId = req.signedCookies[envCoderUserIDCookie]

    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = parseInt(req.body.age, 10);
    const password = createHash(req.body.password);

    const userRegister = {
        last_name,
        email,
        age,
        password
    }

    try {
        const hasNumbers = (inputString) => {
            const regex = /\d/;
            return regex.test(inputString);
        };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!last_name || typeof last_name !== 'string' || hasNumbers(last_name) ||
            !email || !emailRegex.test(email) ||
            !age || typeof age !== 'number' || password === undefined)
            CustomError.createError({
                name: "Error al registrar al usuario con GitHub.",
                cause: ErrorGenerator.generateRegisterGitHubErrorInfo(userRegister),
                message: "La información para el registro está incompleta o no es válida.",
                code: ErrorEnums.INVALID_REGISTER_DATA
            });
    } catch (error) {
        return next(error);
    };

    try {

        // Buscamos el correo en la base de datos: 
        const existSessionControl = await sessionController.getUserController(req, res, email);

        // Verificamos si no hubo algun error en el módulo de session, si lo hubo devolvemos el mensaje de error:
        if (existSessionControl.statusCode === 500) {
            res.send({
                status: 500,
                message: existSessionControl.message
            });
        }

        // Verificamos si el usuario ya esta registrado, en dicho caso le decimos que vaya al login:
        else if (existSessionControl.statusCode === 200) {
            res.send({
                status: 409,
                message: 'Ya existe una cuenta asociada a este correo. Diríjase al login y presione en "Ingresa aquí" para iniciar sesión.'
            });
        }

        // Si el usuario no esta registrado en la base de datos (404), entonces se procede al registro: 
        else if (existSessionControl.statusCode === 404) {

            // Crear el objeto con los datos del formulario extra, para actualizar al usuario creado con los datos de GitHub:
            const updateUser = {
                last_name,
                email,
                age,
                password
            };

            // Actualizar el usuario en la base de datos:
            const updateSessionControl = await sessionController.updateUserController(req, res, next, userId, updateUser);

            // Si se encuantra el usuario lo actualizamos:
            if (updateSessionControl.statusCode === 200) {

                // Extraermos solo el resultado:
                const userExtraForm = updateSessionControl.result;

                // Generar el token JWT:
                let token = jwt.sign({
                    email: userExtraForm.email,
                    first_name: userExtraForm.first_name,
                    role: userExtraForm.role,
                    cart: userExtraForm.cart,
                    userID: userExtraForm._id
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

        };

    } catch (error) {
        req.logger.error(error.message)
        return ('Error al completar datos de session creada con GitHub - formExtra.js: ' + error.message);
    };

};