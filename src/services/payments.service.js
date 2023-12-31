// Import Stripe:
import Stripe from 'stripe';

// Import variables: 
import {
    envStripeKeySecret,
    envStripeKeyPublic,
    envSuccess_url,
    envCancel_url
} from '../config.js';

// Clase para PaymentsService:
export default class PaymentsService {

    constructor() {
        // Instancia de Stripe:
        this.stripe = new Stripe(envStripeKeySecret);
    };

    // Métodos de PaymentsService:

    // Generar intento de pago - Service:
    async newPaymentIntentService(uid, email, order) {

        let response = {};

        try {

            const paymentIntent = await this.stripe.checkout.sessions.create({

                line_items: order.successfulProducts.map(product => ({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.product.title,
                            description: product.product.description,
                        },
                        unit_amount: product.product.price * 100,
                    },
                    quantity: product.quantity,
                })),
                mode: 'payment',
                metadata: {
                    uid: uid,
                    email: email
                },
                success_url: `${envSuccess_url}`,
                cancel_url: `${envCancel_url}`,
            })

            if (paymentIntent.url) {
                response.statusCode = 200;
                response.message = "Intento de pago generado exitosamente.";
                response.result = paymentIntent.url;
            } else {
                response.statusCode = 500;
                response.message = "Error al obtener la URL de Stripe.";
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al generar intento de pago - Service: " + error.message;
        };
        return response;
    };
};