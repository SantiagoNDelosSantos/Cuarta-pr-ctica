// Import SessionDAO: 
import SessionDAO from "../DAO/mongodb/SessionMongo.dao.js";

// Import CartService:
import CartService from "./carts.service.js";

// Import Nodemailer:
import Mail from '../email/nodemailer.js'

// Import jwt: 
import jwt from 'jsonwebtoken';

// Import createHash - isValidPassword: 
import {
    createHash,
    isValidPassword
} from "../utils.js";

// Import variables de entorno:
import {
    envResetPassToken,
    envCoderTokenCookie
} from '../config.js'

// Clase para el Service de session: 
export default class SessionService {

    // Constructor de SessionService: 
    constructor() {
        this.sessionDAO = new SessionDAO();
        this.cartService = new CartService();
        this.mail = new Mail();
    }

    // Métodos de SessionService: 

    // Crear usuario - Service:
    async createUserService(info) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.createUser(info);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario registrado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al registrar al usuario - Service: " + error.message;
        };
        return response;
    };

    // Buscar usuario - Service:
    async getUserService(identifier) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.getUser(identifier);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ningún usuario con el Email, Nombre o ID, ${identifier}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el usuario - Service: " + error.message;
        };
        return response;
    }

    // Actualizar usuario - Service: 
    async updateUserSevice(uid, updateUser) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.updateUser(uid, updateUser);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar los datos del usuario - Service: " + error.message;
        };
        return response;
    };

    // Enviar email para reestablecer contraseña - Service: 
    async getUserAndSendEmailService(email) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.getUser(email);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ninguna cuenta asociada a este correo, ${email}.`;
            } else if (resultDAO.status === "success") {
                // Usuario:
                const user = resultDAO.result;
                // Token - 1h: 
                let token = jwt.sign({
                    email
                }, envResetPassToken, {
                    expiresIn: '1h'
                })
                // Cuerpo del correo:
                let html = `
                <table cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                        <td style="text-align: center;">
                            <img src="https://i.ibb.co/hd9vsgK/Logo-BK-Grande.png" alt="Logo-BK-Grande" border="0" style="max-width: 50% !important; ">
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">
                        <h2 style="font-size: 24px; margin: 0;">Enlace para restablecimiento de contraseña:</h2>
                            <p style="font-size: 16px;">
                            Haga click en el siguiente enlace para restablecer su contraseña:</p>
                            <a href="http://localhost:8080/resetPassword?token=${token}" 
                            style="
                            background-color: #d7eefd;
                            color: #002877; 
                            text-decoration: none;
                            padding: 10px 20px; 
                            border-radius: 1em; 
                            font-size: 16px; 
                            margin: 10px 0; 
                            display: inline-block;"
                            >Restablecer contraseña</a>
                            <p style="font-size: 16px; font-weight: bold;">IMPORTANTE: La validez de este enlace es de 1 hora. Una vez que haya pasado este período, el enlace te llevará automáticamente a la página de "Restablecer Contraseña - Solicitar Correo", donde podrás solicitar uno nuevo.</p>
                            <p style="font-size: 16px;">Gracias, ${user.first_name}.</p>
                            <p style="font-size: 16px;">Para cualquier consulta, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                            </td>
                    </tr>
                </table>`;
                // Enviamos el correo al Nodemailer: 
                const resultSendMail = await this.mail.sendMail(user, "Restablecimiento de contraseña.", html);
                // Verificamos si el correo se envió correctamente:
                if (resultSendMail.accepted.length > 0) {
                    response.statusCode = 200;
                    response.message = "Correo enviado exitosamente.";
                    response.result = resultSendMail;
                } else {
                    response.statusCode = 500;
                    response.message = "Error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al enviar email para restablecer contraseña - Service: " + error.message;
        };
        return response;
    };

    // Reestablecer contraseña - Service: 
    async resetPassUser(userEmail, newPass) {
        let response = {
            userEmail
        };
        try {
            // Buscamos al usuario en la base de datos por su correo: 
            const resultDAO = await this.sessionDAO.getUser(userEmail);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ninguna cuenta asociada a este correo, ${userEmail}.`;
            } else if (resultDAO.status === "success") {
                // Si el usaurio existe, verificamos si la nueva contraseña es igual a la actual: 
                const user = resultDAO.result
                // Si es igual retronamos un error y pedimos una nueva contraseña:
                if (isValidPassword(user, newPass)) {
                    response.statusCode = 400;
                    response.message = `La nueva contraseña que has proporcionado es idéntica a tu contraseña actual. Para restablecer la contraseña, por favor introduce una contraseña diferente. Si prefieres mantener tu contraseña actual, puedes iniciar sesión utilizando tus credenciales habituales haciendo clic en "Iniciar sesión".`;
                } else {
                    // Si la nueva contraseña es distinta a la actual, reestablecemos la contraseña:
                    const password = createHash(newPass);
                    const updateUser = {
                        password
                    };
                    // Enviamos el id del usuario y su nueva contraseña hasheada: 
                    const resultUpdt = await this.sessionDAO.updateUser(user._id, updateUser);
                    // Validamos los resultados:
                    if (resultUpdt.status === "error") {
                        response.statusCode = 500;
                        response.message = resultUpdt.message;
                    } else if (resultUpdt.status === "not found user") {
                        response.statusCode = 404;
                        response.message = "Usuario no encontrado.";
                    } else if (resultUpdt.status === "success") {
                        response.statusCode = 200;
                        response.message = "Usuario actualizado exitosamente.";
                        response.result = resultUpdt.result;
                    };
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al restablecer contraseña - Service: " + error.message;
        };
        return response;
    };

    // Cerrar session - Service:
    async logoutService(req, res, uid) {
        let response = {};
        try {
            const lastConnection = {
                last_connection: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString()
            };
            // Enviamos el id del usaurio y su last_connection:
            const resultUpdt = await this.sessionDAO.updateUser(uid, lastConnection);
            // Validamos los resultados:
            if (resultUpdt.status === "error") {
                response.statusCode = 500;
                response.message = resultUpdt.message;
            } else if (resultUpdt.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultUpdt.status === "success") {
                // Luego de actualizar el last_connection, eliminamos el token de la cookie:
                res.cookie(envCoderTokenCookie, "", {
                    httpOnly: true,
                    signed: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                // Devolvemos un status 200:
                response.statusCode = 200;
                response.message = "Session cerrada exitosamente.";
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al cerrar session - Service: " + error.message;
        };
        return response;
    };

    // Eliminar cuenta - Service: 
    async deleteUserService(uid, cid) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.deleteUser(uid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found session") {
                response.statusCode = 404;
                response.message = `No se encontró ninguna cuenta con este ID, ${uid}.`;
            } else if (resultDAO.status === "success") {
                const deleteCart = await this.cartService.deleteCartService(cid)
                if (deleteCart.statusCode === 200) {
                    response.statusCode = 200;
                    response.message = "Cuenta eliminada exitosamente.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar cuenta - Service: " + error.message;
        };
        return response;
    };

};