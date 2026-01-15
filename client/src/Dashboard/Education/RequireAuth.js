// src/components/RequireAuth.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Helpers/Context/UserContext";

const RequireAuth = ({ children }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return user ? children : null;
};

export default RequireAuth;
