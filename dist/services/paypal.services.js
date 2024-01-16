"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const db_services_1 = __importDefault(require("./db.services"));
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = "https://api-m.sandbox.paypal.com";
const url = `${base}/v2/checkout/orders`;
function generateAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
                throw new Error("MISSING_API_CREDENTIALS");
            }
            const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
            const response = yield fetch(`${base}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            const data = yield response.json();
            return data.access_token;
        }
        catch (error) {
            console.error("Failed to generate Access Token:", error);
        }
    });
}
// Create an order to initiate the transaction
function createPaypalOrder(paymentDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield generateAccessToken();
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
        const response = yield fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    });
}
// Capture the created order to complete the transaction
function capturePaypalOrder(orderId, orderInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;
        const response = yield fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        try {
            yield db_services_1.default.payment.create({
                data: (0, utils_1.createPayment)(orderInfo),
            });
        }
        catch (error) {
            console.error(`Error while creating payment`, error.message);
        }
        return handleResponse(response);
    });
}
function handleResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jsonResponse = yield response.json();
            return {
                jsonResponse,
                httpStatusCode: response.status,
            };
        }
        catch (err) {
            const errorMessage = yield response.text();
            throw new Error(errorMessage);
        }
    });
}
const paypalServices = {
    createPaypalOrder,
    capturePaypalOrder,
};
exports.default = paypalServices;
