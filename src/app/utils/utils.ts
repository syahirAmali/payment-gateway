import { Prisma } from "@prisma/client";

// Form input validation
export const createPayment = (payment: any) => {
    return Prisma.validator<Prisma.PaymentCreateInput>()({
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

export const supportedCurrencies = ["USD", "EUR", "THB", "HKD", "SGD", "AUD"];

export function getCardType(number: string): string {
    let re: RegExp;

    // AMEX
    re = /^3[47]/;
    if (number.match(re) !== null) return "AMEX";

    return "";
}
