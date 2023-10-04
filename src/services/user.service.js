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

    // Subir documentación de usuario - Service: 
    async uploadPremiumDocsService(uid, documentsRuta, documentNames) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.uploadPremiumDocs(uid, documentsRuta, documentNames);
            // Validamos los resultados:
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "parcial success") {
                response.statusCode = 206;
                response.message = `Ya has proporcionado la documentación para ${resultDAO.result1}, sin embargo, la calidad de usuario premium tambien requiere la documentación de ${resultDAO.result2}. Una vez subidos todos los archivos estarás en condiciones de volverte premium.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = `Todos los documentos de ${resultDAO.result} se han cargado exitosamente, ahora estas en condiciones de convertirte en un usuario premium, para completar el proceso solo debes presionar en "Actualizar role", luego de ello puedes verificar el cambio de role en la sección de perfil.`;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Service: " + error.message;
        };
        return response;

    };

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

                // Obtener los nombres de los documentos subidos y creamos un objeto con los name de los archivos que esperamos:
                let docsSubidos = resultDAO.result.documents.map(doc => doc.name);
                let documentNames = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];

                // Verificamos si estan faltando documentos: 
                let documentosFaltantes = documentNames.filter(name => !docsSubidos.includes(name));

                // Creamos una variable para guardar luego el resultado del DAO: 
                let resultRolPremium

                // Si el usuario quiere actualizar su role a premium, verificamos que tenga subidos todos los documentos requeridos: 
                if (newRole === "premium") {
                       // Si el usuario quiere actualizar su rol a premium, verificar los documentos
                    if (docsSubidos.length === 3) {
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    } else {
                        response.statusCode = 422;
                        response.message = `No es posible efectuar el cambio de role a premium, ya que aún no se ha proporcionado toda la documentación requerida para dicha operación. Los documentos faltantes son  ${documentosFaltantes.join(', ')}.`;
                    }
                } else if (newRole === "user") {
                    // Si el usuario quiere volver a ser usuario, no validamos los docs: 
                    resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                }
                // En los dos casos en que sí se puede acceder a la capa del DAO, validamos los resultados:
                if (documentosFaltantes.length === 0) {
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
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

}