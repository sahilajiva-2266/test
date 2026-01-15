import React from "react";
import { useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-blue-700">Login Successful</h1>
        <p className="text-gray-600 mt-3">
          You are logged in successfully using QR.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginSuccess;
