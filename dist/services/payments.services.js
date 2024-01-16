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
const db_services_1 = __importDefault(require("./db.services"));
const utils_1 = require("../utils/utils");
const general_config_1 = __importDefault(require("../configs/general.config"));
const paypal_services_1 = __importDefault(require("./paypal.services"));
const braintree_services_1 = __importDefault(require("./braintree.services"));
function getMultiple(page = 1, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payments = yield db_services_1.default.payment.findMany({
                include: {
                    card: true,
                },
                skip: (page - 1) * general_config_1.default.listPerPage,
                take: general_config_1.default.listPerPage,
            });
            res.json(payments);
        }
        catch (error) {
            console.error(`Error while getting payments`, error.message);
            res.status(500).json({ message: "Error while getting payments" });
        }
    });
}
function checkCardDetails(paymentDetails, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, currency, amount, card } = paymentDetails;
        const fullName = firstName + " " + lastName;
        if (!fullName || !currency || !amount || !card) {
            return res
                .status(400)
                .json({ message: "Some required fields are missing" });
        }
        if (!card.number ||
            !card.expirationMonth ||
            !card.expirationYear ||
            !card.cvv) {
            return res
                .status(400)
                .json({ message: "Some required fields are missing" });
        }
        if (!utils_1.supportedCurrencies.includes(currency)) {
            return res.status(400).json({ message: "Currency not supported" });
        }
        const cardType = (0, utils_1.getCardType)(card.number);
        if (cardType === "AMEX") {
            if (currency !== "USD") {
                return res.status(400).json({ message: "AMEX only supports USD" });
            }
            let response = yield paypal_services_1.default.createPaypalOrder(paymentDetails);
            const orderId = response.jsonResponse.id;
            const approveLink = response.jsonResponse.links.find((link) => link.rel === "approve");
            return {
                orderId: orderId,
                approveLink: approveLink,
                paymentType: "PAYPAL",
            };
        }
        else if (currency === "USD" || currency === "EUR" || currency === "AUD") {
            let response = yield paypal_services_1.default.createPaypalOrder(paymentDetails);
            const orderId = response.jsonResponse.id;
            const approveLink = response.jsonResponse.links.find((link) => link.rel === "approve");
            return {
                orderId: orderId,
                approveLink: approveLink,
                paymentType: "PAYPAL",
            };
        }
        else {
            let response = yield braintree_services_1.default.createSaleTransaction(amount, paymentDetails);
            return {
                paymentType: "BRAINTREE",
                status: response === null || response === void 0 ? void 0 : response.transaction.status,
            };
        }
    });
}
function update(id, paymentDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, currency, amount, card } = paymentDetails;
            const updatedPayment = yield db_services_1.default.payment.update({
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
        }
        catch (error) {
            console.error(`Error while updating payment`, error.message);
            return { message: "Error while updating payment" };
        }
    });
}
function remove(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedPayment = yield db_services_1.default.payment.delete({
                where: {
                    id,
                },
            });
            return deletedPayment;
        }
        catch (error) {
            console.error(`Error while deleting payment`, error.message);
            return { message: "Error while deleting payment" };
        }
    });
}
const _ = {
    checkCardDetails,
    getMultiple,
    update,
    remove,
};
exports.default = _;
