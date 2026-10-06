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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Lista todas as simulações.
app.get("/simulacoes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield db_1.default.query("SELECT * FROM simulacoes ORDER BY id");
        res.json(resultado.rows);
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao listar simulações." });
    }
}));
// Cadastra uma simulação.
app.post("/simulacoes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { uc, cpf, encargos, kwh, valor_kwh } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (typeof uc !== "string" ||
        uc.trim().length === 0 ||
        uc.length > 30 ||
        typeof cpf !== "string" ||
        !/^\d{11}$/.test(cpf) ||
        typeof encargos !== "number" ||
        !Number.isFinite(encargos) ||
        encargos < 0 ||
        typeof kwh !== "number" ||
        !Number.isFinite(kwh) ||
        kwh <= 0 ||
        typeof valor_kwh !== "number" ||
        !Number.isFinite(valor_kwh) ||
        valor_kwh <= 0) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
    }
    try {
        const resultado = yield db_1.default.query(`INSERT INTO simulacoes (uc, cpf, encargos, kwh, valor_kwh)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [uc.trim(), cpf, encargos, kwh, valor_kwh]);
        res.status(201).json(resultado.rows[0]);
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao cadastrar simulação." });
    }
}));
// Busca pelo ID.
app.get("/simulacoes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
        res.status(400).json({ erro: "ID inválido." });
        return;
    }
    try {
        const resultado = yield db_1.default.query("SELECT * FROM simulacoes WHERE id = $1", [id]);
        if (resultado.rows.length === 0) {
            res.status(404).json({ erro: "Simulação não encontrada." });
            return;
        }
        res.json(resultado.rows[0]);
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar simulação." });
    }
}));
// Lista as simulações de uma UC.
app.get("/simulacoes/uc/:uc", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield db_1.default.query("SELECT * FROM simulacoes WHERE uc = $1 ORDER BY id", [req.params.uc]);
        res.json(resultado.rows);
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar por UC." });
    }
}));
// Lista as simulações de um CPF.
app.get("/simulacoes/cpf/:cpf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield db_1.default.query("SELECT * FROM simulacoes WHERE cpf = $1 ORDER BY id", [req.params.cpf]);
        res.json(resultado.rows);
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar por CPF." });
    }
}));
exports.default = app;
