import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Helpers/Context/UserContext.js";
import ProtectedRoute from "./Layouts/ProtectedRoute.js";
import DashboardLayout from "./Dashboardlayout/Dashboardlayout.js";


// Public pages
import Homepage from "./Website/Home.js";
import Loginpage from "./Website/login.js";
import EducationLoginpage from "./Dashboard/Education/login.js";
import QrLoginpage from "./Dashboard/Education/qrlogin.js";
import Registerpage from "./Website/registerform.js";
import Forgotpassword from "./Website/forgotpassword.js";
import Getotp from "./Website/getotp.js";
import Resetpassword from "./Website/resetpassword.js";
import NotFound from "./Website/NotFound.js";
import Unauthorized from "./Website/Unauthorized.js";
import QrPage from "./Modules/Users/QrPage.js";
import LoginSuccess from "./Website/LoginSuccess.js";
import AppQrPage from "./Modules/AppQr/AppQrPage.js";
import QrDownload from "../src/Components/Website/DownloadApp.js";

const AppRoutes = () => {
  const { user } = useUser();
  if (user === undefined) return <div>Loading...</div>;

  const userRole = user?.role?.toLowerCase().replace("_", "") || "";
  console.log("Detected role:", user?.role, "→ normalized:", userRole);

  const allowedRoles = ["superadmin", "admin", "hr", "employee"];

  return (
    <Routes>
      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard/*"
        element={
          user && allowedRoles.includes(userRole) ? (
            <ProtectedRoute allowedRoles={[userRole]}>
              <DashboardLayout userRole={userRole} />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />


      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<EducationLoginpage />} />
      <Route path="/qrdownload" element={<QrDownload />} />

      <Route path="/platform" element={<Loginpage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/getotp" element={<Getotp />} />
      <Route path="/resetpassword" element={<Resetpassword />} />
      <Route path="/qr-login" element={<QrLoginpage />} />
      <Route path="/qr" element={<QrPage />} />
      <Route path="/app-qr" element={<AppQrPage />} />
      <Route path="/LoginQr" element={<QrPage singleAction="login" />} />
      <Route path="/LogoutQr" element={<QrPage singleAction="logout" />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
