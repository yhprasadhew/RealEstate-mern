import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/shared/landingPage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </div>
  );
};

export default App;