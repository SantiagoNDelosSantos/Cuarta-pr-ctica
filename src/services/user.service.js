// Import UserDAO: 
import UserDAO from "../DAO/mongodb/UserMongo.dao.js";

// Import productsService:
import ProductService from "../services/products.service.js"

// Import jwt: 
import jwt from 'jsonwebtoken';

// Import mail:
import Mail from "../email/nodemailer.js";

// Import variables de entorno:
import {
    envCoderSecret,
    envCoderTokenCookie
} from '../config.js'

// Clase para el Service de usuarios: 
export default class SessionService {

    constructor() {
        this.userDAO = new UserDAO();
        this.productService = new ProductService();
        this.mail = new Mail();
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
    async changeRoleService(res, uid, requesterRole) {
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

                // Resultado de borrar los productos del usuario premium, cuando vuelve a tener role user:
                let deleteProdPremRes

                if (requesterRole === "admin" && newRole === "premium") {
                    // Si es el admin quien desea actualizar el role del usuario a premium, no se valida la documentación:
                    resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                } else if (requesterRole === "user" && newRole === "premium") {
                    // Si el usuario quiere actualizar su role a premium, verificamos que tenga subidos todos los documentos requeridos:
                    if (docsSubidos.length === 3) {
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    } else {
                        resultRolPremium = { status: "incomplete documents" };
                    }
                } else if (newRole === "user") {
                    // Si el usuario premim se cambia de role a user, entonces eliminamos todos sus productos:
                    deleteProdPremRes = await this.productService.deleteAllPremiumProductService(uid, uid, userRole);
                    if (deleteProdPremRes.statusCode === 200 || deleteProdPremRes.statusCode === 404) {
                        // Si el usuario premium quiere volver a ser usuario, no validamos los docs: 
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    };
                };

                if (resultRolPremium.status === "error") {
                    response.statusCode = 500;
                    response.message = resultRolPremium.message;
                } else if (resultRolPremium.status === "incomplete documents") {
                    response.statusCode = 422;
                    response.message = `No es posible efectuar el cambio de role a premium, ya que aún no se ha proporcionado toda la documentación requerida para dicha operación. Los documentos faltantes son  ${documentosFaltantes.join(', ')}.`;
                } else if (resultRolPremium.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultRolPremium.status === "success") {

                    // De preium a user:
                    if (resultRolPremium.status === "success" && newRole === "user") {
                        response.statusCode = 200;
                        response.message = `Usuario actualizado exitosamente, su rol ha sido actualizado a ${newRole}. ${deleteProdPremRes.message}`;
                    } else if (resultRolPremium.status === "success" && newRole === "premium") {
                        // De user a premium:
                        response.statusCode = 200;
                        response.message = `Usuario actualizado exitosamente, su rol ha sido actualizado a ${newRole}.`;
                    };

                    if (requesterRole !== "admin") {
                        // Traemos al usuario actualizado:
                        const newUser = await this.userDAO.getUser(uid);
                        if (newUser.status = "success") {
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
                        }
                    };

                };
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

    // Obtener todos los usuarios - Controller:
    async getAllUsersService() {
        let response = {};
        try {
            const resultDAO = await this.userDAO.getAllUsers();
            // Validamos los resultados:
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found users") {
                response.statusCode = 404;
                response.message = "No se han encontrado usuarios.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.result = resultDAO.result;
                response.message = `Usuarios obtenidos exitosamente.`;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los usuarios - Service: " + error.message;
        };
        return response;
    };

    // Eliminar usuarios inactivos (2 Días) - Service:
    async deleteInactivityUsersService() {
        let response = {};
        try {
            const resultDAO = await this.userDAO.deleteInactivityUsers();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found inactivity users") {
                response.statusCode = 404;
                response.message = "No se han encontrado usuarios inactivos.";
            } else if (resultDAO.status === "success") {

                const user = [];

                for (let i = 0; i < resultDAO.result.length; i += 2) {
                    user.push([resultDAO.result[i], resultDAO.result[i + 1]]);
                }

                // Variable para validar si todos los correos se enviaron correctamente:
                let envioExitoso = [];
                let envioFallido = [];

                // Procesar cada par de nombre y correo para enviar el correo
                for (const [name, email] of user) {

                    const html = `
                    <table cellspacing="0" cellpadding="0" width="100%">
                        <tr>
                            <td style="text-align: center;">
                                <img src="https://i.ibb.co/hd9vsgK/Logo-BK-Grande.png" alt="Logo-BK-Grande" border="0" style="max-width: 40% !important;">
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center;">
                                <h2 style="font-size: 24px; margin: 0;">Notificación de eliminación de cuenta por inactividad</h2>
                                <p style="font-size: 16px;">
                                    Estimado ${name}, lamentamos informarte que tu cuenta ha sido eliminada debido a la inactividad de la misma. Esta acción es necesaria para mantener la calidad y seguridad de nuestra plataforma.
                                </p>
                                <p style="font-size: 16px; font-weight: bold;">
                                    - Fecha y hora de eliminación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}
                                </p>
                                <p style="font-size: 16px;">
                                    Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
                                </p>
                                <p style="font-size: 16px;">
                                    Gracias por tu comprensión.
                                </p>
                            </td>
                        </tr>
                    </table>`

                    // Envía el correo utilizando la dirección de correo electrónico proporcionada en 'email'
                    const resultSendMail = await this.mail.sendMail(email, "Notificación de eliminación de cuenta", html);

                    if (resultSendMail.accepted.length > 0) {
                        envioExitoso.push(email);
                    } else if (resultSendMail.rejected && resultSendMail.rejected.length > 0) {
                        envioFallido.push(email);
                    };

                };

                if (envioFallido.length === 0) {
                    response.statusCode = 200;
                    response.message = "Usuarios inactivos eliminados y notificados exitosamente.";
                    response.result = "Correos de usuarios eliminados: " + envioExitoso;
                } else {
                    response.statusCode = 500;
                    response.message = "Error al enviar los correos de notificación. Usuarios a los que no se ha podido notificar: " + envioFallido;
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar usuarios inactivos - Service: " + error.message;
        };
        return response;
    };

};