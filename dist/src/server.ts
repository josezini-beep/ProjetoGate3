import express from "express";

const app = express();

app.get("/saude", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});