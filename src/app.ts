import express from "express";
import pool from "./db";

const app = express();

app.use(express.json());

// Lista todas as simulações.
app.get("/simulacoes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM simulacoes ORDER BY id"
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar simulações." });
  }
});

// Cadastra uma simulação.
app.post("/simulacoes", async (req, res) => {
  const { uc, cpf, encargos, kwh, valor_kwh } = req.body ?? {};

  if (
    typeof uc !== "string" ||
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
    valor_kwh <= 0
  ) {
    res.status(400).json({ erro: "Dados inválidos." });
    return;
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO simulacoes (uc, cpf, encargos, kwh, valor_kwh)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uc.trim(), cpf, encargos, kwh, valor_kwh]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao cadastrar simulação." });
  }
});

// Busca pelo ID.
app.get("/simulacoes/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    res.status(400).json({ erro: "ID inválido." });
    return;
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM simulacoes WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ erro: "Simulação não encontrada." });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar simulação." });
  }
});

// Lista as simulações de uma UC.
app.get("/simulacoes/uc/:uc", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM simulacoes WHERE uc = $1 ORDER BY id",
      [req.params.uc]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar por UC." });
  }
});

// Lista as simulações de um CPF.
app.get("/simulacoes/cpf/:cpf", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM simulacoes WHERE cpf = $1 ORDER BY id",
      [req.params.cpf]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar por CPF." });
  }
});

export default app;