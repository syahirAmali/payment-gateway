import express from "express";
import PaymentController from "../controllers/payments.controllers";

const paymentsRouter = express.Router();

// Payment routes

/* GET payments. */
paymentsRouter.get("/", PaymentController.get);

/* POST payment */
paymentsRouter.post("/", PaymentController.create);

/* POST capture payment */
paymentsRouter.post("/capture", PaymentController.capture);

/* PUT payment */
paymentsRouter.put("/:id", PaymentController.update);

/* DELETE payment */
paymentsRouter.delete("/:id", PaymentController.remove);

export default paymentsRouter;
