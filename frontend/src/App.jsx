import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/shared/landingPage";
import Properties from "./pages/shared/Properties";
import PropertyDetails from "./pages/shared/PropertyDetails";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path ="/properties" element={<Properties/> } />
         <Route path ="/properties/:id" element={<PropertyDetails/> } />

      </Routes>
    </div>
  );
};

export default App;