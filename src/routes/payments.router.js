// Import Router:
import { Router } from "express";

// Passport:
import passport from "passport";

// Import Middleware - Routes: 
import {
    rolesRMiddlewareUsers
} from "./Middlewares/rolesRoutes.middleware.js";

// Import CartController:
import PaymentsController from "../controllers/paymentsController.js";

// Instancia de Router: 
const paymentsRouter = Router();

// Instancia de PaymentsController:
let paymentsController = new PaymentsController();

// Generar intento de pago - Router: (USER, PREMIUM) 
paymentsRouter.get('/paymentsIntents', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, async (req, res, next) => {
    const result = await paymentsController.newPaymentIntentController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default paymentsRouter;