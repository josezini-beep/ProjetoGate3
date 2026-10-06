"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// Permite receber dados em JSON.
app.use(express_1.default.json());
app.get("/simulação", (req, res) => {
    console.log(simulações);
    res.json({ status: "Base de simulações" });
});
app.post("/simulação", (req, res) => {
    const nova_simulação = req.body;
    res.json({ status: "ok" });
    simulações.push(nova_simulação);
});
app.get("/simulação/:id", (req, res) => {
    res.json({ status: "ok" });
    simulação.findById(req.params.id).then((simulação) => {
        res.json(simulação);
    });
});
app.get("/simulação/:uc", (req, res) => {
    res.json({ status: "ok" });
    simulação.find(req.params.uc).then((simulação) => {
        res.json(simulação);
    });
});
app.get("/simulação/:cpf", (req, res) => {
    res.json({ status: "ok" });
    simulação.find(req.params.cpf).then((simulação) => {
        res.json(simulação);
    });
});
exports.default = app;
