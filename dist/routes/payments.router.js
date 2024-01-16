"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_controllers_1 = __importDefault(require("../controllers/payments.controllers"));
const paymentsRouter = express_1.default.Router();
// Payment routes
/* GET payments. */
paymentsRouter.get("/", payments_controllers_1.default.get);
/* POST payment */
paymentsRouter.post("/", payments_controllers_1.default.create);
/* POST capture payment */
paymentsRouter.post("/capture", payments_controllers_1.default.capture);
/* PUT payment */
paymentsRouter.put("/:id", payments_controllers_1.default.update);
/* DELETE payment */
paymentsRouter.delete("/:id", payments_controllers_1.default.remove);
exports.default = paymentsRouter;
