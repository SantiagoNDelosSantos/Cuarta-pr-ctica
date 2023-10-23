// Import Router:
import { Router } from "express";

import passport from 'passport';

// Import TicketController: 
import TicketController from '../controllers/ticketsController.js'

// Import Middleware - Routes: 
import { rolesRMiddlewareUsers, rolesRMiddlewareAdmin
} from "./Middlewares/rolesRoutes.middleware.js";

// Instancia de Router:
const ticketRouter = Router();

// Instancia de CartController: 
let ticketController = new TicketController();

// Crear un ticket - Router:
ticketRouter.post("/", passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewareUsers, async (req, res, next) => {
    const result = await ticketController.createTicketController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Traer un ticket por su ID - Router:
ticketRouter.get("/:tid", passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewareAdmin, async (req, res, next) => {
    const result = await ticketController.getTicketByIdController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default ticketRouter;