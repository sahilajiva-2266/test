import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "../Dashboardsidebaarmenu/Dashboardmenu";
import Header from "../SuperAdmin/header.js";
import Footer from "../SuperAdmin/footer.js";

// 🧩 All your shared modules
import Dashboard from "../SuperAdmin/Dashboard.js";
import GetUsers from "../Modules/Users/List";
import AddUser from "../Modules/Users/Add";
import EditUser from "../Modules/Users/Edit";
import Employees from "../Modules/Users/Employees/List";
import Roles from "../Modules/Users/Roles/List";
import PermissionsTable from "../Modules/Users/Permissions/permission";
import Attendance from "../Modules/Users/Attendance/List";
import Contractors from "../Modules/Users/Contractors/List";
import Rfid from "../Modules/Users/Rfid/List";
import Device from "../Modules/Users/Device/List";
import Zones from "../Modules/Users/Zones/List";
import Visitors from "../Modules/Users/Visitors/List";
import AddVisitor from "../Modules/Users/Visitors/Add";
import EditVisitor from "../Modules/Users/Visitors/Edit";
import ActivityPgae from "../Modules/Users/ActivityPgae.js";
import Fields from "../Modules/Settings/Fields/Fieldlist";
import LocationList from "../Modules/Employee/Location/List.js";
import LocationAdd from "../Modules/Employee/Location/Add.js";
import LocationEdit from "../Modules/Employee/Location/Edit.js";
import Settings from "../Modules/Users/Settings.js";
import NotificationsPage from "../Modules/Notifications/NotificationsPage.js";
import EnquiriesPage from "../Modules/Enquiries/EnquiriesPage";


function DashboardLayout({ userRole }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    console.log("📍 Current path:", location.pathname);
  }, [location.pathname]);

  // ✅ Universal layout styling
  return (
    <div className="AJ-dashboard min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
      />

      {/* Right Section */}
      <div
        className="flex flex-col transition-all duration-300 sm:ml-0 md:w-full right-section-all-pages "
        style={{
          width: isCollapsed ? "100%" : "82%",
          marginLeft: isCollapsed ? "6%" : "15%",
        }}
      >
        <Header />

        <main className="flex-1 mt-2 sm:mt-5"
        >
          <div className="`p-4 shadow min-h-[calc(100vh-2%)]` sm:p-0 sm:mt-5 !sm:ml-4 !md:ml-4">
            <Routes>
              {/* ✅ Dashboard */}
              <Route index element={<Dashboard />} />

              {/* ✅ Users */}
              <Route path="users" element={<GetUsers />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/edit/:id" element={<EditUser />} />

              {/* ✅ Employees, Roles, Permissions */}
              <Route path="users/employees" element={<Employees />} />
              <Route path="users/visitors" element={<Visitors />} />
              <Route path="users/visitors/add" element={<AddVisitor />} />
              <Route path="users/visitors/edit/:id" element={<EditVisitor />} />
              <Route path="users/roles" element={<Roles />} />
              <Route path="users/permissions" element={<PermissionsTable />} />

              {/* ✅ Attendance */}
              <Route path="users/attendance" element={<Attendance />} />

              {/* ✅ Contractors, RFID, Device, Zones */}
              <Route path="users/contractor" element={<Contractors />} />
              <Route path="users/rfid" element={<Rfid />} />
              <Route path="users/device" element={<Device />} />
              <Route path="users/zones" element={<Zones />} />
              <Route path="users/location" element={<LocationList />} />
              <Route path="users/activity" element={<ActivityPgae />} />
              <Route path="users/settings" element={<Settings />} />


              <Route path="users/location/add" element={<LocationAdd />} />
              <Route
                path="users/location/edit/:id"
                element={<LocationEdit />}
              />



              {/* ✅ Settings */}
              <Route path="settings/fields" element={<Fields />} />

              {/* 🔔 Notifications (FIXED PATH) */}
              <Route path="notifications" element={<NotificationsPage />} />
              {/* 📩 Enquiries (FIXED PATH) */}
              <Route path="enquiries" element={<EnquiriesPage />} />

              {/* ✅ Default fallback */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div >
  );
}

export default DashboardLayout;
