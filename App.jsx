import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import ActivityPage from "./ActivityPage";
import About from "./About"; // ✅ add this import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Header />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/activity/:activity" element={<ActivityPage />} />
      <Route path="/about" element={<About />} />  {/* ✅ new About route */}
    </Routes>
  );
}

export default App;







