import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ExerciseLibrary from "./pages/exerciselibrary";
import ExerciseDetail from "./pages/exercisedetail";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <Link to="/exercises">Go to Exercise Library</Link>
      </div>

      <Routes>
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/exercises/:code" element={<ExerciseDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

