import _ from "../services/payments.services";
import paypalServices from "../services/paypal.services";

async function get(req: any, res: any, next: any) {
    try {
        await _.getMultiple(req.query.page, res);
    } catch (err: any) {
        console.error(`Error while getting payments`, err.message);
        next(err);
    }
}

async function create(req: any, res: any, next: any) {
    try {
        res.json(await _.checkCardDetails(req.body, res));
    } catch (err: any) {
        console.error(`Error while creating payment`, err.message);
        next(err);
    }
}

async function capture(req: any, res: any, next: any) {
    try {
        res.json(
            await paypalServices.capturePaypalOrder(
                req.body.orderId,
                req.body.orderInfo
            )
        );
    } catch (err: any) {
        console.error(`Error while capturing payment`, err.message);
        next(err);
    }
}

async function update(req: any, res: any, next: any) {
    try {
        res.json(await _.update(req.params.id, req.body));
    } catch (err: any) {
        console.error(`Error while updating payment`, err.message);
        next(err);
    }
}

async function remove(req: any, res: any, next: any) {
    try {
        res.json(await _.remove(req.params.id));
    } catch (err: any) {
        console.error(`Error while deleting payment`, err.message);
        next(err);
    }
}

const paymentController = {
    get,
    create,
    update,
    remove,
    capture,
};

export default paymentController;
