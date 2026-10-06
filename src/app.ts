import express from "express";
import pool from "./db";
import Decimal from "decimal.js";

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
  const {
    uc,
    cpf,
    encargos,
    impostos,
    kwh,
    valor_kwh,
    desconto_percentual
  } = req.body ?? {};

  const valores = [
    encargos,
    impostos,
    kwh,
    valor_kwh,
    desconto_percentual
  ];

  if (
    typeof uc !== "string" ||
    uc.trim().length === 0 ||
    uc.length > 30 ||
    typeof cpf !== "string" ||
    !/^\d{11}$/.test(cpf) ||
    !valores.every(
      (valor) => typeof valor === "number" && Number.isFinite(valor)
    ) ||
    encargos < 0 ||
    impostos < 0 ||
    kwh <= 0 ||
    valor_kwh <= 0 ||
    desconto_percentual < 0 ||
    desconto_percentual > 100
  ) {
    res.status(400).json({ erro: "Dados inválidos." });
    return;
  }

  // Confere os limites e as casas decimais das colunas.
  const limites = [
    { valor: encargos, casas: 2, maximo: "9999999999.99" },
    { valor: impostos, casas: 2, maximo: "9999999999.99" },
    { valor: kwh, casas: 3, maximo: "999999999.999" },
    { valor: valor_kwh, casas: 6, maximo: "999999.999999" },
    { valor: desconto_percentual, casas: 2, maximo: "100" }
  ];

  if (
    limites.some(({ valor, casas, maximo }) => {
      const decimal = new Decimal(valor);
      return decimal.decimalPlaces() > casas || decimal.gt(maximo);
    })
  ) {
    res.status(400).json({
      erro: "Valor acima do limite ou com casas decimais demais."
    });
    return;
  }

  try {
    // Desconto apenas sobre a energia.
    const valorEnergia = new Decimal(kwh).times(valor_kwh);

    const economiaMensal = valorEnergia
      .times(desconto_percentual)
      .dividedBy(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // Projeção com a mesma economia nos 12 meses.
    const economiaAnual = economiaMensal.times(12);

    if (economiaAnual.gt("9999999999.99")) {
      res.status(400).json({ erro: "Economia acima do limite permitido." });
      return;
    }

    const resultado = await pool.query(
      `INSERT INTO simulacoes (
        uc, cpf, encargos, impostos, kwh, valor_kwh,
        desconto_percentual, economia_mensal, economia_anual
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        uc.trim(),
        cpf,
        encargos,
        impostos,
        kwh,
        valor_kwh,
        desconto_percentual,
        economiaMensal.toFixed(2),
        economiaAnual.toFixed(2)
      ]
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