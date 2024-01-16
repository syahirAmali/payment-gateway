import { PaymentDetails } from "../models/payments.model";
import prisma from "./db.services";
import { getCardType, supportedCurrencies } from "../utils/utils";
import general from "../configs/general.config";
import paypalServices from "./paypal.services";
import braintreeService from "./braintree.services";

async function getMultiple(page = 1, res: any) {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                card: true,
            },
            skip: (page - 1) * general.listPerPage,
            take: general.listPerPage,
        });

        res.json(payments);
    } catch (error: any) {
        console.error(`Error while getting payments`, error.message);
        res.status(500).json({ message: "Error while getting payments" });
    }
}

async function checkCardDetails(paymentDetails: PaymentDetails, res: any) {
    const { firstName, lastName, currency, amount, card } = paymentDetails;
    const fullName = firstName + " " + lastName;

    if (!fullName || !currency || !amount || !card) {
        return res
            .status(400)
            .json({ message: "Some required fields are missing" });
    }

    if (
        !card.number ||
        !card.expirationMonth ||
        !card.expirationYear ||
        !card.cvv
    ) {
        return res
            .status(400)
            .json({ message: "Some required fields are missing" });
    }

    if (!supportedCurrencies.includes(currency)) {
        return res.status(400).json({ message: "Currency not supported" });
    }

    const cardType = getCardType(card.number);

    if (cardType === "AMEX") {
        if (currency !== "USD") {
            return res.status(400).json({ message: "AMEX only supports USD" });
        }

        let response = await paypalServices.createPaypalOrder(paymentDetails);

        const orderId = response.jsonResponse.id;
        const approveLink = response.jsonResponse.links.find(
            (link: { rel: string }) => link.rel === "approve"
        );

        return {
            orderId: orderId,
            approveLink: approveLink,
            paymentType: "PAYPAL",
        };
    } else if (currency === "USD" || currency === "EUR" || currency === "AUD") {
        let response = await paypalServices.createPaypalOrder(paymentDetails);
        const orderId = response.jsonResponse.id;
        const approveLink = response.jsonResponse.links.find(
            (link: { rel: string }) => link.rel === "approve"
        );

        return {
            orderId: orderId,
            approveLink: approveLink,
            paymentType: "PAYPAL",
        };
    } else {
        let response = await braintreeService.createSaleTransaction(
            amount,
            paymentDetails
        );

        return {
            paymentType: "BRAINTREE",
            status: response?.transaction.status,
        };
    }
}

async function update(id: number, paymentDetails: PaymentDetails) {
    try {
        const { firstName, lastName, currency, amount, card } = paymentDetails;

        const updatedPayment = await prisma.payment.update({
            where: {
                id,
            },
            data: {
                firstName,
                lastName,
                currency,
                amount,
                card: {
                    update: {
                        number: card.number,
                        expirationMonth: card.expirationMonth,
                        expirationYear: card.expirationYear,
                        cvv: card.cvv,
                    },
                },
            },
        });
        return updatedPayment;
    } catch (error: any) {
        console.error(`Error while updating payment`, error.message);
        return { message: "Error while updating payment" };
    }
}

async function remove(id: number) {
    try {
        const deletedPayment = await prisma.payment.delete({
            where: {
                id,
            },
        });
        return deletedPayment;
    } catch (error: any) {
        console.error(`Error while deleting payment`, error.message);
        return { message: "Error while deleting payment" };
    }
}

const _ = {
    checkCardDetails,
    getMultiple,
    update,
    remove,
};

export default _;
