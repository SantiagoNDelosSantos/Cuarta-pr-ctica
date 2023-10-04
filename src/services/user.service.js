// Import UserDAO: 
import UserDAO from "../DAO/mongodb/UserMongo.dao.js";

// Import jwt: 
import jwt from 'jsonwebtoken';

// Import variables de entorno:
import {
    envResetPassToken,
    envCoderSecret,
    envCoderTokenCookie
} from '../config.js'

// Clase para el Service de usuarios: 
export default class SessionService {

    constructor() {
        this.userDAO = new UserDAO();
    }

    // Métodos para UserService: 

    // Cambiar rol del usuario - Service:
    async changeRoleService(res, uid) {
        let response = {};
        try {
            // Buscamos al usuario en la base de datos por su ID: 
            const resultDAO = await this.userDAO.getUser(uid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `Usuario no encontrado.`;
            } else if (resultDAO.status === "success") {
                // Si el usuario existe, extraemos su rol actual: 
                let userRole = resultDAO.result.role;
                const newRole = userRole === "user" ? "premium" : "user";
                const updateUser = {
                    role: newRole
                };
                // Enviamos el nuevo role al updateUser:
                const resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                // Validamos los resultados:
                if (resultRolPremium.status === "error") {
                    response.statusCode = 500;
                    response.message = resultRolPremium.message;
                } else if (resultRolPremium.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultRolPremium.status === "success") {
                    response.statusCode = 200;
                    response.message = `Usuario actualizado exitosamente, su rol a sido actualizado a ${newRole}.`;
                    // Traemos al usuario actualizado:
                    const newUser = await this.userDAO.getUser(uid);
                    //  Actualizamos el role del usuario en el token: 
                    let token = jwt.sign({
                        email: newUser.result.email,
                        first_name: newUser.result.first_name,
                        role: newUser.result.role,
                        cart: newUser.result.cart,
                        userID: newUser.result._id
                    }, envCoderSecret, {
                        expiresIn: '7d'
                    });
                    // Sobrescribimos la cookie:
                    res.cookie(envCoderTokenCookie, token, {
                        httpOnly: true,
                        signed: true,
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    })
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

    async uploadPremiumDocsService(uid, rutaIdentification, rutaProofOfAddres, rutaBankStatement) {
        let response = {};
        try {
            // Buscamos al usuario en la base de datos por su correo: 
            const resultDAO = await this.userDAO.getUser(uid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `Usuario no encontrado.`;
            } else if (resultDAO.status === "success") {

                // Enviamos el nuevo role al updateUser:
                const updateUser = 



                const resultDocs = await this.userDAO.updateUser(uid, updateUser);


                // Validamos los resultados:




                if (resultRolPremium.status === "error") {
                    response.statusCode = 500;
                    response.message = resultRolPremium.message;
                } else if (resultRolPremium.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultRolPremium.status === "success") {
                    response.statusCode = 200;
                    response.message = `Documentos subidos exitosamente.`;
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Service: " + error.message;
        };
        return response;

    };

}