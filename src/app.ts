import express from "express";

const app = express();
interface Simulação {
  id: number;
  uc: string;
  cpf: string;
  data: string;
  encargos: number;
  kwh: number;
  valor_kwh: number;
  }
// Permite receber dados em JSON.
app.use(express.json());

app.get("/simulação", (req, res) => {
  console.log(simulações);
  res.json({ status: "Base de simulações" });
});
app.post("/simulação", (req, res) => {
  const nova_simulação: Simulação = req.body;
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
export default app;