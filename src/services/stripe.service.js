import Stripe from 'stripe';

import { envStripeKeySecret, envStripeKeyPublic } from '../config.js';

export default class PaymentsService {

    constructor(){
        this.stripe = new Stripe(envStripeKeySecret)
    };

    createPaymentIntent = async (data) => {

        const paymentIntent = this.stripe.paymentIntents.create(data);
    
        return paymentIntent;
    
    
    }; 

};