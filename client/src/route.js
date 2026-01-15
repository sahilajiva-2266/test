import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { getUserRole } from "./helpers/utils.js";
import Teacherlayout from "./Layouts/Teacherlayout.js";
import WebsiteLayout from "./Layouts/WebsiteLayout.js";
import Studentlayout from "./Layouts/Studentlayout.js";
import ParentLayout from "./Layouts/ParentLayout.js";
import SuperAdminLayout from "./Layouts/SuperadminLayout.js";
import PermissionDenied from "./Website/PermissionDenied.js";
import Registerpage from "./Website/registerform.js";
import Getotp from "./Website/getotp.js";
import Resetpassword from "./Website/resetpassword.js";
import Homepage from "./Website/Home.js";
import NotFound from "./Website/NotFound.js";
import Loginpage from "../src/Website/login.js";
import SuperadminDashboard from "./SuperAdmin/Dasboard.js";
import AdminDashboard from "./Admin/admindashboard.js";
import Forgotpassword from "../src/Website/forgotpassword.js";
import TeacherDashboard from "./Teacher/teacherdashboard.js";
import ParentDashboard from "./SuperAdmin/Dasboard.js";
import ContractorDashboard from "./Dashboard/Education/Contractor/Dasboard.js";
import SupervisorDashboard from "./Dashboard/Education/Supervisor/Dasboard.js";

const App = () => {
  const userRole = "super_admin"; //getUserRole(); // Fetch the user role from token/cookie
  console.log(userRole);
  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          render={(props) => {
            // Render appropriate layout based on role
            if (userRole === "super_admin") {
              console.log(userRole, "hagdgadgajd");
              return <SuperAdminLayout {...props} />;
            }
            if (userRole === "admin") {
              return <AdminLayout {...props} />;
            }

            // If none of the roles match, redirect to permission denied or some fallback
            return <PermissionDenied />;
          }}
        />

        {/* Website Layout for Other Routes */}
        <Route path="/*" element={<WebsiteLayout />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/" element={<Homepage />} />

        <Route path="/register" element={<Registerpage />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/getotp" element={<Getotp />} />
        <Route path="/resetpassword" element={<Resetpassword />} />
        {/* Permission Denied Page */}
        <Route path="/permission-denied" element={<PermissionDenied />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />

        {/* <Route path="/" element={<RoleButtons />} /> */}
        <Route path="/dashboard/superadmin" element={<SuperadminDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/contractor" element={<ContractorDashboard />} />
        <Route path="/dashboard/Supervisor" element={<SupervisorDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
