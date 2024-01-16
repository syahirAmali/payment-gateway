"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const payments_router_1 = __importDefault(require("./routes/payments.router"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use(express_1.default.static("public"));
app.use("/payments", payments_router_1.default);
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});
app.listen(3000, () => console.log(`[server]: Server is running at http://localhost:${port}`));
exports.default = app;
