import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/shared/landingPage";
import Properties from "./pages/shared/Properties";
import PropertyDetails from "./pages/shared/PropertyDetails";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/shared/Profile";
import AdminLayout from "./components/common/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import SellerRequests from "./pages/admin/SellerRequests";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContacts from "./pages/admin/AdminContacts";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

const App = () => {
  return (
    <div>
      <Routes>
      
        <Route path = "/login"  element={<Login/>} />
        <Route path = "/verify-email" element={<VerifyEmail/>} />
        <Route path = "/register" element={<Register/>} />
        <Route path ="/forgot-password" element={<ForgotPassword /> } />
        <Route path ="/reset-password/:token" element={<ResetPassword /> } />


        <Route path="/" element={<LandingPage />} />
        <Route path ="/properties" element={<Properties/> } />
         <Route path ="/properties/:id" element={<PropertyDetails/> } />

          <Route path ="/properties/:id" element={<PropertyDetails/> } />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/seller-requests" element={<SellerRequests />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
          </Route>
        </Route>

       <Route path ="/profile" element={<Profile/> } />

 

      </Routes>
    </div>
  );
};

export default App;