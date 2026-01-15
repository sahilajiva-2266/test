import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { PopupProvider } from "./Helpers/PopupContext.js";
import { UserProvider } from "./Helpers/Context/UserContext.js";
import AppRoutes from "./AppRoutes.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    <UserProvider>
      <PopupProvider>
        <Router>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </PopupProvider>
    </UserProvider>
  );
};

export default App;
