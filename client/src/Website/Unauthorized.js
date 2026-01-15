import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚫 Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/login" style={{ color: "#007bff" }}>
        Go to Login
      </Link>
    </div>
  );
}
