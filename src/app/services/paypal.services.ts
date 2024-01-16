import { PaymentDetails } from "../models/payments.model";
import { createPayment } from "../utils/utils";
import prisma from "./db.services";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = "https://api-m.sandbox.paypal.com";
const url = `${base}/v2/checkout/orders`;

async function generateAccessToken() {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
        ).toString("base64");
        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
}

// Create an order to initiate the transaction
async function createPaypalOrder(paymentDetails: PaymentDetails) {
    const accessToken = await generateAccessToken();
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: paymentDetails.currency,
                    value: paymentDetails.amount,
                },
            },
        ],
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
}

// Capture the created order to complete the transaction
async function capturePaypalOrder(orderId: string, orderInfo: any) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    try {
        await prisma.payment.create({
            data: createPayment(orderInfo),
        });
    } catch (error: any) {
        console.error(`Error while creating payment`, error.message);
    }

    return handleResponse(response);
}

async function handleResponse(response: any) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

const paypalServices = {
    createPaypalOrder,
    capturePaypalOrder,
};

export default paypalServices;
