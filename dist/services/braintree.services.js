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
const braintree_1 = __importDefault(require("braintree"));
const db_services_1 = __importDefault(require("./db.services"));
const utils_1 = require("../utils/utils");
if (!process.env.BT_MERCHANT_ID ||
    !process.env.BT_PUBLIC_KEY ||
    !process.env.BT_PRIVATE_KEY) {
    throw new Error("Cannot find necessary environment variables.");
}
const gateway = new braintree_1.default.BraintreeGateway({
    environment: braintree_1.default.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY,
});
function createSaleTransaction(amount, paymentDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const expirationDate = paymentDetails.card.expirationMonth +
                "/" +
                paymentDetails.card.expirationYear;
            const response = yield gateway.transaction.sale({
                amount: amount.toString(),
                creditCard: {
                    number: paymentDetails.card.number,
                    expirationDate: expirationDate,
                },
            });
            try {
                yield db_services_1.default.payment.create({
                    data: (0, utils_1.createPayment)(paymentDetails),
                });
            }
            catch (error) {
                console.error(`Error while creating payment`, error.message);
            }
            return response;
        }
        catch (error) {
            console.error("Failed to create sale transaction:", error);
        }
    });
}
const braintreeService = {
    createSaleTransaction,
};
exports.default = braintreeService;
