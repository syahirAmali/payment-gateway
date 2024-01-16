"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardType = exports.supportedCurrencies = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
// Form input validation
const createPayment = (payment) => {
    return client_1.Prisma.validator()({
        firstName: payment.firstName,
        lastName: payment.lastName,
        currency: payment.currency,
        amount: payment.amount,
        card: {
            create: {
                number: payment.card.number,
                expirationMonth: payment.card.expirationMonth,
                expirationYear: payment.card.expirationYear,
                cvv: payment.card.cvv,
            },
        },
    });
};
exports.createPayment = createPayment;
exports.supportedCurrencies = ["USD", "EUR", "THB", "HKD", "SGD", "AUD"];
function getCardType(number) {
    let re;
    // AMEX
    re = /^3[47]/;
    if (number.match(re) !== null)
        return "AMEX";
    return "";
}
exports.getCardType = getCardType;
