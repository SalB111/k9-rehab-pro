import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Load JSON manually (works on all Node versions)
const exercises = JSON.parse(fs.readFileSync("./exercises.json", "utf8"));

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