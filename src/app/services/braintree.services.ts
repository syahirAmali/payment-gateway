import braintree from "braintree";
import prisma from "./db.services";
import { createPayment } from "../utils/utils";

if (
    !process.env.BT_MERCHANT_ID ||
    !process.env.BT_PUBLIC_KEY ||
    !process.env.BT_PRIVATE_KEY
) {
    throw new Error("Cannot find necessary environment variables.");
}

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY,
});

async function createSaleTransaction(amount: number, paymentDetails: any) {
    try {
        const expirationDate =
            paymentDetails.card.expirationMonth +
            "/" +
            paymentDetails.card.expirationYear;
        const response = await gateway.transaction.sale({
            amount: amount.toString(),
            creditCard: {
                number: paymentDetails.card.number,
                expirationDate: expirationDate,
            },
        });

        try {
            await prisma.payment.create({
                data: createPayment(paymentDetails),
            });
        } catch (error: any) {
            console.error(`Error while creating payment`, error.message);
        }

        return response;
    } catch (error) {
        console.error("Failed to create sale transaction:", error);
    }
}

const braintreeService = {
    createSaleTransaction,
};

export default braintreeService;
