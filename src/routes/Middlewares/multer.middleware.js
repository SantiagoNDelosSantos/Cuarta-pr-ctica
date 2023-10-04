import multer from "multer";
import __dirname from '../../utils.js';
console.log(__dirname)
import {
    v4 as uuidV4
} from 'uuid'

export const documentsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = file.fieldname === 'identification' ? 'identification' :
            file.fieldname === 'proofOfAddress' ? 'proofOfAddress' :
            file.fieldname === 'bankStatement' ? 'bankStatement' : 'unknown';
        cb(null, __dirname + '/public/imgs/documents/' + folder);
    },
    filename: function (req, file, cb) {
        cb(null, uuidV4() + " - " + file.originalname)
    }
});

export const uploaderDocuments = multer({ storage: documentsStorage })