import express from "express";
import cors from "cors";
import exercises from "./exercises.json" assert { type: "json" };

const app = express();
app.use(cors());
app.use(express.json());

app.get("/exercises", (req, res) => {
  res.json(exercises);
});

app.get("/exercises/:code", (req, res) => {
  const exercise = exercises.find((e) => e.code === req.params.code);
  if (!exercise) return res.status(404).json({ error: "Not found" });
  res.json(exercise);
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
