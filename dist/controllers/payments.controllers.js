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
const payments_services_1 = __importDefault(require("../services/payments.services"));
const paypal_services_1 = __importDefault(require("../services/paypal.services"));
function get(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield payments_services_1.default.getMultiple(req.query.page, res);
        }
        catch (err) {
            console.error(`Error while getting payments`, err.message);
            next(err);
        }
    });
}
function create(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield payments_services_1.default.checkCardDetails(req.body, res));
        }
        catch (err) {
            console.error(`Error while creating payment`, err.message);
            next(err);
        }
    });
}
function capture(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield paypal_services_1.default.capturePaypalOrder(req.body.orderId, req.body.orderInfo));
        }
        catch (err) {
            console.error(`Error while capturing payment`, err.message);
            next(err);
        }
    });
}
function update(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield payments_services_1.default.update(req.params.id, req.body));
        }
        catch (err) {
            console.error(`Error while updating payment`, err.message);
            next(err);
        }
    });
}
function remove(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield payments_services_1.default.remove(req.params.id));
        }
        catch (err) {
            console.error(`Error while deleting payment`, err.message);
            next(err);
        }
    });
}
const paymentController = {
    get,
    create,
    update,
    remove,
    capture,
};
exports.default = paymentController;
