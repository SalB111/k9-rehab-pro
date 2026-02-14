import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "1rem" }}>
      <h1>K9-Rehab-Protocal</h1>
      <p>Welcome to the system.</p>
      <p>
        <Link to="/intake">Open Patient Intake Form</Link>
      </p>
      <p>
        <Link to="/exercises">Go to Exercise Library</Link>
      </p>
    </div>
  );
}
