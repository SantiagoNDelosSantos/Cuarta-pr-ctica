// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de usuarios:
import { userModel } from './models/users.model.js'

// Importación de variables de entorno: 
import { envMongoURL } from "../../config.js";

// Clase para el DAO de User:
export default class UserDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);
    
    // Métodos para el DAO de User:

    // Buscar un usuario - DAO:
    async getUser(identifier) {
        let response = {};
        try {
            const conditions = [{ email: identifier }, { first_name: identifier } ];
            if (mongoose.Types.ObjectId.isValid(identifier)) { conditions.push({ _id: identifier });
            }
            const result = await userModel.findOne({ $or: conditions });
            if (result === null) {
                response.status = "not found user";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener la session - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar user - DAO:
    async updateUser(uid, updateUser) {
        let response = {};
        try {
            let result = await userModel.updateOne({ _id: uid }, { $set: updateUser });
            if (result.matchedCount === 0) {
                response.status = "not found user";
            } else if (result.matchedCount === 1){
                let userUpdate = await userModel.findOne({ _id: uid });
                response.status = "success";
                response.result = userUpdate;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar los datos de usuario - DAO: " + error.message;
        };
        return response;
    };

};