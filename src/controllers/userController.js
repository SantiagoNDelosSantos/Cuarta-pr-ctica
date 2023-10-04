// Import UserService:
import UserService from '../services/user.service.js';

// Import mongoose para validación de IDs:
import mongoose from "mongoose";

// Errores:
import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

// Clase para el Controller de User:
export default class UserController {

    constructor() {
        this.userService = new UserService();
    }

    // Métodos para UserController: 

    // Subir documentación de usuario - Controller: 
    async uploadPremiumDocsController(req, res, next) {

        // Obtenemos el ID del usaurio: 
        const uid = req.params.uid

        // Creamos algunas variables para almacenar las rutas definitivas:
        let rutaIdentification;
        let rutaProofOfAddres;
        let rutaBankStatement;

        // Validamos que archivos se han subido y extreamos las rutas de estos archivos en variables:
        const parteComun = 'public\\';

        if (req.files.identification) {
            const identification = req.files.identification[0].path;
            const indice = identification.indexOf(parteComun);
            const ruta = identification.substring(indice + parteComun.length);
            rutaIdentification = ruta
        }
        if (req.files.proofOfAddress) {
            const proofOfAddress = req.files.proofOfAddress[0].path;
            const indice = proofOfAddress.indexOf(parteComun);
            const ruta = proofOfAddress.substring(indice + parteComun.length);
            rutaProofOfAddres = ruta
        }
        if (req.files.bankStatement) {
            const bankStatement = req.files.bankStatement[0].path;
            const indice = bankStatement.indexOf(parteComun);
            const ruta = bankStatement.substring(indice + parteComun.length);
            rutaBankStatement = ruta
        }

        // Validamos el ID del usuario y que se haya enviado para subir, al menos 1 archivo/documento
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al obtener al usuario por ID.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            } else if (rutaIdentification === undefined && rutaProofOfAddres === undefined && rutaBankStatement === undefined) {
                CustomError.createError({
                    name: "Error al subir documentación de usuario.",
                    cause: ErrorGenerator.uploadPremiumDocsErrorInfo(req.files.identification, req.files.proofOfAddress, req.files.bankStatement),
                    message: "No se ha proporcionado ningun documento.",
                    code: ErrorEnums.INVALID_FORM_FILES_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };

        // Una vez que se han extraido las rutas en sus respectivas variables, las guardamos en un arreglo que se pasara al service: 

        const documentsRuta = [ rutaIdentification, rutaProofOfAddres, rutaBankStatement ];

        // Tambien creamos un arreglo para con los name que asignaremos a los documentos cuando se realice el push en el DAO:
        const documentNames = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];

        let response = {};
        try {
            // Enviamos al service el UID y los dos arreglos:
            const resultService = await this.userService.uploadPremiumDocsService(uid, documentsRuta, documentNames);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 206 || resultService.statusCode === 200 ) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;

    };

    // Cambiar rol del usuario - Controller: 
    async changeRoleController(req, res, next) {
        const uid = req.params.uid
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al obtener al usuario por ID.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.userService.changeRoleService(res, uid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 422 ) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

};