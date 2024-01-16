import express from "express";
import bodyParser from "body-parser";
import paymentRouter from "./routes/payments.router";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static("public"));
app.use("/payments", paymentRouter);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.listen(3000, () =>
    console.log(`[server]: Server is running at http://localhost:${port}`)
);

export default app;
