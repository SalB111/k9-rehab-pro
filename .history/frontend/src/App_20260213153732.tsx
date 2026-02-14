import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import ExerciseLibrary from "./pages/exerciselibrary";
import ExerciseDetail from "./pages/exercisedetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/exercises/:code" element={<ExerciseDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

