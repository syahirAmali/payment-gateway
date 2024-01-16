// Payment Types

export type PaymentDetails = {
    firstName: string;
    lastName: string;
    currency: string;
    amount: number;
    card: CreditCard;
};

type CreditCard = {
    number: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
};
