import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/shared/landingPage";
import Properties from "./pages/shared/Properties";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path ="/properties "element={<Properties/> } />
      </Routes>
    </div>
  );
};

export default App;