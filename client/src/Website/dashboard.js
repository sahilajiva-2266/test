import React, { useState } from "react";
import Log from "../../../images/log.png";

import SuperAdminLayout from "../../Layouts/super_adminlayout";
import AdminLayout from "../../Layouts/adminlayout.js";
import TeacherLayout from "../../Layouts/teacherlayout.js";
import StudentLayout from "../../Layouts/studentlayout.js";
import ParentLayout from "../../Layouts/parentlayout.js";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("personal", "superadmin");

  const showSection = (section) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "superadmin":
        return <SuperAdminLayout />;
      case "admin":
        return <AdminLayout />;
      case "teacher":
        return <TeacherLayout />;
      case "student":
        return <StudentLayout />;
      case "parent":
        return <ParentLayout />;

      default:
        return <h2>Select a section</h2>;
    }
  };
  return (
    <div className="main-dashboard-page">
      <div className="main-dashboard-inner-page">
        <div className="home-section-dashboard-outer">
          {/* sidebar */}
          <div className="home-section">
            <div className="left-navbar">
              <div className="vertical-section">
                <ul>
                  <li>
                    <button
                      class="active"
                      href="superadmin"
                      type="button"
                      className={activeSection === "superadmin" ? "active" : ""}
                      onClick={() => showSection("superadmin")}
                    >
                      Super Admin
                    </button>
                  </li>
                  <li>
                    <button
                      href="admin"
                      type="button"
                      className={activeSection === "admin" ? "active" : ""}
                      onClick={() => showSection("admin")}
                    >
                      Admin
                    </button>
                  </li>
                  <li>
                    <button
                      href="teacher"
                      type="button"
                      className={activeSection === "teacher" ? "active" : ""}
                      onClick={() => showSection("teacher")}
                    >
                      Teacher
                    </button>
                  </li>
                  <li>
                    <button
                      href="student"
                      type="button"
                      className={activeSection === "student" ? "active" : ""}
                      onClick={() => showSection("student")}
                    >
                      Student
                    </button>
                  </li>
                  <li>
                    <button
                      href="parent"
                      type="button"
                      className={activeSection === "parent" ? "active" : ""}
                      onClick={() => showSection("parent")}
                    >
                      Parent
                    </button>
                  </li>
                  <li>
                    <button
                      href="class"
                      type="button"
                      className={activeSection === "class" ? "active" : ""}
                      onClick={() => showSection("class")}
                    >
                      Class
                    </button>
                  </li>
                  <li>
                    <button
                      href="admission"
                      type="button"
                      className={activeSection === "admission" ? "active" : ""}
                      onClick={() => showSection("admission")}
                    >
                      <a href="/admission">Admission Form</a>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Personal Information Section */}
            {activeSection === "superadmin" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeSection === "admin" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeSection === "teacher" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeSection === "student" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeSection === "parent" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeSection === "admission" && (
              <div className="section-content-inner">
                {/* Render the active section layout */}
                <div className="section-content">{renderActiveSection()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
